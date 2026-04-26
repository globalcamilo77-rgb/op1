import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyPixApproved, notifyPixGenerated } from '@/lib/pushcut'
import { addIpBlock } from '@/lib/supabase-ip-blocks'
import { logPixWebhook } from '@/lib/supabase-pix-webhook'

export const runtime = 'nodejs'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return ''
}

interface WebhookBody {
  event?: string
  data?: {
    id?: string
    externalReference?: string
    amount?: number
    customerIp?: string
    customer?: {
      name?: string
      email?: string
      phone?: string
    }
  }
}

export async function POST(request: NextRequest) {
  const requestIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || ''

  let body: WebhookBody = {}
  try {
    body = (await request.json()) as WebhookBody
  } catch {
    body = {}
  }

  const event = body.event || ''
  const data = body.data || {}
  const supabase = getSupabase()

  // Identificar tipo do evento e normalizar
  const isApproved = event === 'payment.confirmed' || event === 'payment.paid' || event === 'pix.approved'
  const isGenerated = event === 'payment.created' || event === 'pix.generated'

  // Buscar pedido relacionado (se houver)
  type OrderRow = {
    id: string
    customer_ip: string | null
    customer_name: string | null
    customer_phone: string | null
    customer_email?: string | null
    customer_document: string | null
    total: number | null
  }
  let order: OrderRow | null = null

  if (supabase && data.externalReference) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, customer_ip, customer_name, customer_phone, customer_email, customer_document, total')
      .eq('id', data.externalReference)
      .maybeSingle()
    order = (orderData as unknown as OrderRow | null) ?? null
  }

  // IP do cliente: prioriza o que vem do pedido, depois o do request, depois o do payload
  const clientIp = order?.customer_ip || data.customerIp || requestIp || ''

  let ipBlockId: string | null = null
  let pushcutResult: unknown = null

  try {
    if (isApproved) {
      // 1) Atualiza status do pedido
      if (supabase && order) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            pix_transaction_id: data.id ?? null,
          })
          .eq('id', order.id)
      }

      // 2) Bloqueia IP por 1 hora (auto)
      if (clientIp) {
        const block = await addIpBlock({
          ip: clientIp,
          reason: 'pix_aprovado',
          manual: false,
          expiresInMinutes: 60,
          metadata: {
            orderId: order?.id ?? null,
            pixId: data.id ?? null,
            event,
          },
        })
        ipBlockId = block?.id ?? null
      }

      // 3) Notificacao Pushcut
      const approvedAmount =
        typeof order?.total === 'number' && order.total > 0
          ? order.total
          : typeof data.amount === 'number'
            ? data.amount / 100
            : 0
      pushcutResult = await notifyPixApproved({
        amount: approvedAmount,
        customerName: order?.customer_name ?? data.customer?.name ?? undefined,
        customerPhone: order?.customer_phone ?? data.customer?.phone ?? undefined,
        customerDocument: order?.customer_document ?? undefined,
        externalReference: order?.id ?? data.externalReference,
        paymentId: data.id,
      })
    } else if (isGenerated) {
      pushcutResult = await notifyPixGenerated({
        amount: typeof data.amount === 'number' ? data.amount / 100 : 0,
        customerName: data.customer?.name ?? undefined,
        customerPhone: data.customer?.phone ?? undefined,
        externalReference: data.externalReference,
        paymentId: data.id,
      })
    }
  } catch (error) {
    console.error('[pix/webhook] erro processando evento:', error)
  }

  // Sempre loga o webhook recebido
  await logPixWebhook({
    eventType: isApproved ? 'pix_aprovado' : isGenerated ? 'pix_gerado' : event || 'desconhecido',
    status: 'processed',
    payload: { body, pushcutResult },
    clientIp: clientIp || null,
    userAgent,
    pixId: data.id ?? null,
    amount: typeof data.amount === 'number' ? data.amount / 100 : null,
    customerName: order?.customer_name ?? data.customer?.name ?? null,
    customerEmail: order?.customer_email ?? data.customer?.email ?? null,
    customerPhone: order?.customer_phone ?? data.customer?.phone ?? null,
    ipBlockId,
  })

  return NextResponse.json({ received: true, blocked: Boolean(ipBlockId), event })
}

// GET para verificar status do pagamento (polling do frontend)
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ status: 'pending' })
  }
  const { data: order } = await supabase
    .from('orders')
    .select('status, paid_at')
    .eq('id', orderId)
    .single()
  if (order?.status === 'paid') {
    return NextResponse.json({ status: 'paid', paidAt: order.paid_at })
  }
  return NextResponse.json({ status: 'pending' })
}
