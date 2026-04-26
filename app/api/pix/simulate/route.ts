import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint de simulacao de webhook PIX.
 * Constroi um payload identico ao que a Koliseu envia e dispara o
 * webhook real (`/api/pix/webhook`), permitindo testar todo o fluxo:
 * captura de IP, registro em pix_webhook_log, criacao de ip_blocks,
 * notificacao Pushcut, etc.
 *
 * Body esperado:
 *   {
 *     event: 'pix_gerado' | 'pix_aprovado',
 *     pixId?: string,
 *     amount?: number,
 *     orderId?: string,
 *     customerName?: string,
 *     customerEmail?: string,
 *     customerPhone?: string,
 *     ip?: string  // IP que o webhook deve registrar (default: o IP do admin)
 *   }
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    /* corpo opcional */
  }

  const event = (body.event as string) === 'pix_gerado' ? 'pix_gerado' : 'pix_aprovado'
  const pixId = (body.pixId as string) || `test-${Date.now()}`
  const amount = typeof body.amount === 'number' ? body.amount : 100.0
  const orderId = (body.orderId as string) || `order-test-${Date.now()}`

  // IP que sera registrado pelo webhook real - default: IP do admin que clicou
  const adminIp =
    (body.ip as string) ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  const customerName = (body.customerName as string) || 'Cliente Teste'
  const customerEmail = (body.customerEmail as string) || 'teste@alfaconstrucao.com.br'
  const customerPhone = (body.customerPhone as string) || '11999999999'

  // Payload no formato Koliseu - status PAID dispara pix_aprovado, PENDING dispara pix_gerado
  const koliseuStatus = event === 'pix_aprovado' ? 'PAID' : 'PENDING'

  const koliseuPayload = {
    id: pixId,
    status: koliseuStatus,
    amount,
    externalReference: orderId,
    paymentMethod: 'PIX',
    customer: {
      name: customerName,
      email: customerEmail,
      document: '12345678900',
      phone: customerPhone,
    },
    qrCode: koliseuStatus === 'PENDING' ? '00020126...test' : null,
    paidAt: koliseuStatus === 'PAID' ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  }

  // Dispara o webhook real, propagando o IP do admin como x-forwarded-for
  // para o webhook capturar corretamente e bloquear esse IP em 1h.
  const origin = request.nextUrl.origin
  const webhookUrl = `${origin}/api/pix/webhook`

  let webhookResult: unknown = null
  let webhookError: string | null = null
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': adminIp,
        'x-pix-simulated': '1',
        'user-agent': 'AlfaAdmin/Simulator',
      },
      body: JSON.stringify(koliseuPayload),
    })
    webhookResult = await res.json().catch(() => ({ status: res.status }))
  } catch (err) {
    webhookError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json({
    ok: !webhookError,
    event,
    pixId,
    orderId,
    forwardedIp: adminIp,
    payloadSent: koliseuPayload,
    webhookResult,
    webhookError,
  })
}
