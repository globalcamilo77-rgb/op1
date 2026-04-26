import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processPixWebhook, type PixWebhookBody } from '@/lib/pix-webhook-processor'

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

export async function POST(request: NextRequest) {
  const requestIp = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || ''

  let body: PixWebhookBody = {}
  try {
    body = (await request.json()) as PixWebhookBody
  } catch {
    body = {}
  }

  const result = await processPixWebhook(body, { requestIp, userAgent })
  return NextResponse.json({
    received: true,
    blocked: result.blocked,
    event: result.event,
    pushcutOk: result.ok,
    pushcutError: result.pushcutError,
  })
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
