import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, transactionId, amount, customerName, customerEmail, customerPhone, customerDocument } = body

    // Obter IP do cliente
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               'unknown'

    // Salvar pedido no banco
    const { error: orderError } = await supabase
      .from('orders')
      .upsert({
        id: orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_document: customerDocument,
        customer_ip: ip,
        total: amount,
        status: 'paid',
        payment_method: 'pix',
        pix_transaction_id: transactionId,
        paid_at: new Date().toISOString(),
      })

    if (orderError) {
      console.error('Erro ao salvar pedido:', orderError)
    }

    // Bloquear IP do cliente
    const { error: blockError } = await supabase
      .from('blocked_ips')
      .upsert({
        ip,
        reason: `Pagamento confirmado - Pedido ${orderId}`,
        order_id: orderId,
        blocked_at: new Date().toISOString(),
      })

    if (blockError) {
      console.error('Erro ao bloquear IP:', blockError)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Pagamento confirmado e IP bloqueado',
      orderId,
      ip,
    })
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
