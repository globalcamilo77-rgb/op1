import { NextRequest, NextResponse } from 'next/server'
import { processPixWebhook, type PixWebhookBody } from '@/lib/pix-webhook-processor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint de simulacao de webhook PIX.
 * Chama processPixWebhook DIRETO (sem loopback HTTP), garantindo que
 * Pushcut + ip_block + pix_webhook_log rodem do mesmo jeito que rodariam
 * com um POST real da Koliseu.
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
  const webhookEvent = isApproved ? 'payment.confirmed' : 'payment.created'

  const customer = {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    document: '12345678900',
  }
  const data = {
    id: pixId,
    status: koliseuStatus,
    amount: Math.round(amount * 100), // centavos
    externalReference: orderId,
    paymentMethod: 'PIX',
    customer,
    customerIp: adminIp,
    qrCode: koliseuStatus === 'PENDING' ? '00020126...test' : null,
    paidAt: koliseuStatus === 'PAID' ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  }

  const webhookPayload: PixWebhookBody = { event: webhookEvent, data }

  const result = await processPixWebhook(webhookPayload, {
    requestIp: adminIp,
    userAgent: 'AlfaAdmin/Simulator',
  })

  return NextResponse.json({
    ok: result.ok,
    event: eventType,
    pixId,
    orderId,
    forwardedIp: adminIp,
    payloadSent: webhookPayload,
    webhookResult: {
      received: true,
      blocked: result.blocked,
      detectedAs: result.detectedAs,
      ipBlockId: result.ipBlockId,
      pushcutResult: result.pushcutResult,
    },
    webhookError: result.pushcutError,
  })
}
