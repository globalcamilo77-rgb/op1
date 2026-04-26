import { createClient } from '@supabase/supabase-js'
import { notifyPixApproved, notifyPixGenerated } from '@/lib/pushcut'
import { addIpBlock } from '@/lib/supabase-ip-blocks'
import { isIpAllowed } from '@/lib/supabase-ip-allowlist'
import { logPixWebhook } from '@/lib/supabase-pix-webhook'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export interface PixWebhookData {
  id?: string
  externalReference?: string
  amount?: number
  status?: string
  customerIp?: string
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
}

export interface PixWebhookBody extends PixWebhookData {
  event?: string
  data?: PixWebhookData
}

export interface PixWebhookResult {
  ok: boolean
  event: 'pix_aprovado' | 'pix_gerado' | 'desconhecido'
  blocked: boolean
  ipBlockId: string | null
  pushcutResult: unknown
  pushcutError: string | null
  detectedAs: { isApproved: boolean; isGenerated: boolean; rawStatus: string }
}

/**
 * Logica completa de processamento de webhook PIX, isolada do transporte HTTP
 * para que tanto o endpoint /api/pix/webhook quanto o /api/pix/simulate
 * possam invocar a mesma rotina sem chamadas loopback fragéis.
 */
export async function processPixWebhook(
  body: PixWebhookBody,
  ctx: { requestIp: string; userAgent: string },
): Promise<PixWebhookResult> {
  const event = body.event || ''
  const data: PixWebhookData = body.data || (body as PixWebhookData)
  const rawStatus = (data.status || '').toUpperCase()
  const supabase = getSupabase()

  const isApproved =
    event === 'payment.confirmed' ||
    event === 'payment.paid' ||
    event === 'pix.approved' ||
    rawStatus === 'PAID' ||
    rawStatus === 'CONFIRMED' ||
    rawStatus === 'APPROVED'
  const isGenerated =
    event === 'payment.created' ||
    event === 'pix.generated' ||
    (!isApproved && (rawStatus === 'PENDING' || rawStatus === 'CREATED' || rawStatus === 'WAITING'))

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

  const clientIp = order?.customer_ip || data.customerIp || ctx.requestIp || ''

  let ipBlockId: string | null = null
  let pushcutResult: unknown = null
  let pushcutError: string | null = null

  try {
    if (isApproved) {
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

      if (clientIp) {
        // Camuflagem: se o IP estiver na allowlist (ex.: operador testando),
        // NAO bloqueia. Apenas loga "skipped" no metadata.
        const allowed = await isIpAllowed(clientIp)
        if (!allowed) {
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
        } else {
          console.log('[pix-webhook] IP', clientIp, 'esta na allowlist — bloqueio ignorado')
        }
      }

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
    pushcutError = error instanceof Error ? error.message : String(error)
    console.error('[pix-webhook-processor] erro:', error)
  }

  const eventLabel: PixWebhookResult['event'] = isApproved
    ? 'pix_aprovado'
    : isGenerated
      ? 'pix_gerado'
      : 'desconhecido'

  await logPixWebhook({
    eventType: eventLabel,
    status: 'processed',
    payload: { body, pushcutResult, pushcutError },
    clientIp: clientIp || null,
    userAgent: ctx.userAgent,
    pixId: data.id ?? null,
    amount: typeof data.amount === 'number' ? data.amount / 100 : null,
    customerName: order?.customer_name ?? data.customer?.name ?? null,
    customerEmail: order?.customer_email ?? data.customer?.email ?? null,
    customerPhone: order?.customer_phone ?? data.customer?.phone ?? null,
    ipBlockId,
  })

  return {
    ok: !pushcutError,
    event: eventLabel,
    blocked: Boolean(ipBlockId),
    ipBlockId,
    pushcutResult,
    pushcutError,
    detectedAs: { isApproved, isGenerated, rawStatus },
  }
}
