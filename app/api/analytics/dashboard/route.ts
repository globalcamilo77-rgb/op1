import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET(_req: NextRequest) {
  try {
    // Total leads
    const { count: total_leads } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })

    // Total orders
    const { count: total_orders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    // Receita
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('amount, created_at')
      .eq('status', 'paid')

    const revenue = (paidOrders || []).reduce(
      (sum: number, o: { amount?: number | string }) =>
        sum + Number(o.amount || 0),
      0,
    )

    // Leads por cidade
    const { data: leadsRaw } = await supabase
      .from('leads')
      .select('city, created_at, funnel_slug')
      .order('created_at', { ascending: false })
      .limit(1000)

    const cityMap = new Map<string, number>()
    const funnelMap = new Map<string, number>()
    const dayMap = new Map<string, number>()

    ;(leadsRaw || []).forEach(
      (l: {
        city?: string | null
        funnel_slug?: string | null
        created_at?: string | null
      }) => {
        if (l.city) {
          cityMap.set(l.city, (cityMap.get(l.city) || 0) + 1)
        }
        if (l.funnel_slug) {
          funnelMap.set(
            l.funnel_slug,
            (funnelMap.get(l.funnel_slug) || 0) + 1,
          )
        }
        if (l.created_at) {
          const day = String(l.created_at).slice(0, 10)
          dayMap.set(day, (dayMap.get(day) || 0) + 1)
        }
      },
    )

    const leads_by_city = Array.from(cityMap.entries()).map(([city, count]) => ({
      city,
      count,
    }))
    const leads_by_funnel = Array.from(funnelMap.entries()).map(
      ([funnel, count]) => ({ funnel, count }),
    )
    const leads_by_day = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([day, count]) => ({ day, count }))

    const conversion_rate = total_leads
      ? (((total_orders || 0) / total_leads) * 100).toFixed(2)
      : '0'

    return NextResponse.json({
      total_leads: total_leads || 0,
      total_orders: total_orders || 0,
      revenue: revenue.toFixed(2),
      conversion_rate,
      leads_by_city,
      leads_by_funnel,
      leads_by_day,
    })
  } catch (error) {
    console.error('[v0] Erro em /api/analytics/dashboard:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard' },
      { status: 500 },
    )
  }
}
