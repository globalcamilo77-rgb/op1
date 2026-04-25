import { NextResponse } from 'next/server'
import { notifyPixGenerated } from '@/lib/pushcut'

// Endpoint de teste para validar que os 3 webhooks Pushcut estao recebendo
// as notificacoes de Pix gerado. Acesse via GET para disparar uma notificacao
// de teste com valor R$ 199,90.
export async function GET() {
  const result = await notifyPixGenerated({
    amount: 199.9,
    customerName: 'Teste de Webhook',
    customerPhone: '11999990000',
    customerDocument: '12345678900',
    externalReference: `test-${Date.now()}`,
    paymentId: 'test-payment-id',
  })

  return NextResponse.json({
    message: 'Notificacao de teste enviada para os 3 webhooks Pushcut',
    ...result,
  })
}
