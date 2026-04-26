import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint de simulacao de webhook PIX.
 * Constroi um payload com os dois formatos suportados pelo webhook real
 * (event + data + status crus do gateway), garantindo que tanto o
 * Pushcut quanto o ip_block sejam disparados ao testar.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    /* corpo opcional */
  }

  const eventType = (body.event as string) === 'pix_gerado' ? 'pix_gerado' : 'pix_aprovado'
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

  const isApproved = eventType === 'pix_aprovado'
  const koliseuStatus = isApproved ? 'PAID' : 'PENDING'
  // Tipo de evento que o webhook reconhece em body.event
  const webhookEvent = isApproved ? 'payment.confirmed' : 'payment.created'

  // Payload no formato canonico esperado pelo webhook: { event, data: {...} }
  // O webhook tambem aceita os campos crus no topo (status PAID/PENDING),
  // mas mandar no formato cru + envelope cobre os dois caminhos.
  const customer = {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    document: '12345678900',
  }
  const data = {
    id: pixId,
    status: koliseuStatus,
    amount: Math.round(amount * 100), // webhook divide por 100, entao manda em centavos
    externalReference: orderId,
    paymentMethod: 'PIX',
    customer,
    customerIp: adminIp,
    qrCode: koliseuStatus === 'PENDING' ? '00020126...test' : null,
    paidAt: koliseuStatus === 'PAID' ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  }

  const webhookPayload = { event: webhookEvent, data }

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
      body: JSON.stringify(webhookPayload),
    })
    webhookResult = await res.json().catch(() => ({ status: res.status }))
  } catch (err) {
    webhookError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json({
    ok: !webhookError,
    event: eventType,
    pixId,
    orderId,
    forwardedIp: adminIp,
    payloadSent: webhookPayload,
    webhookResult,
    webhookError,
  })
}
