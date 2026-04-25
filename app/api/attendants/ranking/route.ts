import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export const dynamic = 'force-dynamic'

// Os atendentes nao vivem mais na tabela attendants - eles vem dos contatos do
// /adminlr/whatsapp (Zustand store no cliente). Esta API apenas retorna o
// agrupamento de pedidos pagos por attendant_name (texto livre que o admin
// preenche ao criar/editar um pedido).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month'

  const now = new Date()
  let startDate: Date | null = null

  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'week') {
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  try {
    const supabase = getSupabase()

    let ordersQuery = supabase
      .from('orders')
      .select('id, attendant_name, total, status, paid_at, created_at')
      .in('status', ['paid', 'confirmed', 'completed'])

    if (startDate) {
      ordersQuery = ordersQuery.gte('paid_at', startDate.toISOString())
    }

    const { data: orders, error: ordErr } = await ordersQuery

    if (ordErr) throw ordErr

    // Agrupar por attendant_name
    const grouped = new Map<
      string,
      { name: string; revenue: number; orders_count: number }
    >()

    ;(orders || []).forEach((order) => {
      const name = (order.attendant_name || '').trim()
      if (!name) return

      const existing = grouped.get(name) || { name, revenue: 0, orders_count: 0 }
      existing.revenue += Number(order.total || 0)
      existing.orders_count += 1
      grouped.set(name, existing)
    })

    const stats = Array.from(grouped.values())

    return NextResponse.json({
      stats,
      period,
      total_revenue: stats.reduce((sum, s) => sum + s.revenue, 0),
      total_orders: stats.reduce((sum, s) => sum + s.orders_count, 0),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
