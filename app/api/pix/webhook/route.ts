import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyPixApproved } from '@/lib/pushcut'

export const runtime = 'nodejs'

// Criar cliente Supabase com service role
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Webhook da Koliseu - verificar status de pagamento
    const { event, data } = body
    
    if (event === 'payment.confirmed' || event === 'payment.paid') {
      const supabase = getSupabase()
      
      if (supabase && data?.externalReference) {
        // Buscar o pedido pelo externalReference (orderId)
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('id', data.externalReference)
          .single()
        
        if (order) {
          // Atualizar status do pedido para pago
          await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              paid_at: new Date().toISOString(),
              pix_transaction_id: data.id
            })
            .eq('id', data.externalReference)
          
          // Bloquear IP do cliente apos pagamento
          if (order.customer_ip) {
            await supabase
              .from('blocked_ips')
              .upsert({
                ip: order.customer_ip,
                reason: 'purchase_completed',
                order_id: order.id,
                blocked_at: new Date().toISOString()
              }, {
                onConflict: 'ip'
              })
          }

          // Disparar notificacao de Pix Aprovado para os 3 dispositivos com valor real
          const approvedAmount =
            typeof order.total === 'number' && order.total > 0
              ? order.total
              : typeof data?.amount === 'number'
                ? data.amount / 100
                : 0
          const notifyResult = await notifyPixApproved({
            amount: approvedAmount,
            customerName: order.customer_name ?? undefined,
            customerPhone: order.customer_phone ?? undefined,
            customerDocument: order.customer_document ?? undefined,
            externalReference: order.id,
            paymentId: data?.id,
          })
          console.log('[v0] Pushcut Pix aprovado:', notifyResult)
        }
      }
      
      return NextResponse.json({ received: true })
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
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
