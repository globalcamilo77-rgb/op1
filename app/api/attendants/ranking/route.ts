import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export const dynamic = 'force-dynamic'

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

    const { data: attendants, error: attErr } = await supabase
      .from('attendants')
      .select('id, name, email, phone, avatar_url, goal_monthly')
      .eq('active', true)

    if (attErr) throw attErr

    let ordersQuery = supabase
      .from('orders')
      .select('id, attendant_id, total, status, paid_at, created_at')
      .in('status', ['paid', 'confirmed', 'completed'])

    if (startDate) {
      ordersQuery = ordersQuery.gte('paid_at', startDate.toISOString())
    }

    const { data: orders, error: ordErr } = await ordersQuery

    if (ordErr) throw ordErr

    const ranking = (attendants || []).map((att) => {
      const myOrders = (orders || []).filter((o) => o.attendant_id === att.id)
      const revenue = myOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
      const ordersCount = myOrders.length
      const ticketAvg = ordersCount > 0 ? revenue / ordersCount : 0
      const goal = Number(att.goal_monthly || 0)
      const goalProgress = goal > 0 ? (revenue / goal) * 100 : 0

      return {
        id: att.id,
        name: att.name,
        email: att.email,
        phone: att.phone,
        avatar_url: att.avatar_url,
        goal_monthly: goal,
        revenue,
        orders_count: ordersCount,
        ticket_avg: ticketAvg,
        goal_progress: goalProgress,
      }
    })

    ranking.sort((a, b) => b.revenue - a.revenue)

    const rankingWithPosition = ranking.map((r, index) => ({
      ...r,
      position: index + 1,
    }))

    return NextResponse.json({
      ranking: rankingWithPosition,
      period,
      total_revenue: ranking.reduce((sum, r) => sum + r.revenue, 0),
      total_orders: ranking.reduce((sum, r) => sum + r.orders_count, 0),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
