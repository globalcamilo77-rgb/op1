import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase credentials not configured')
  return createClient(url, key)
}

export interface PaidOrderRow {
  id: string
  total: number
  paid_at: string
  source: string
  medium: string
  campaign: string
}

/**
 * Retorna apenas pedidos PAGOS (paid_at IS NOT NULL e status = 'paid')
 * para o painel de Marketing & Trafego nao contar pedidos pendentes
 * como compras.
 *
 * Filtro:
 *   ?since=ISO date (default: 90 dias atras)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const sinceParam = req.nextUrl.searchParams.get('since')
    const sinceIso = sinceParam
      ? new Date(sinceParam).toISOString()
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('orders')
      .select('id, total, amount, paid_at, status, tracking, created_at')
      .eq('status', 'paid')
      .not('paid_at', 'is', null)
      .gte('paid_at', sinceIso)
      .order('paid_at', { ascending: false })
      .limit(2000)

    if (error) {
      console.error('[v0] /api/analytics/sales erro:', error.message)
      return NextResponse.json({ orders: [], error: error.message }, { status: 500 })
    }

    const orders: PaidOrderRow[] = (data ?? []).map((row: any) => {
      const tracking = (row.tracking ?? {}) as Record<string, string>
      const total = Number(row.total ?? row.amount ?? 0)
      return {
        id: String(row.id),
        total,
        paid_at: String(row.paid_at ?? row.created_at ?? new Date().toISOString()),
        source: tracking.utm_source || tracking.source || 'direct',
        medium: tracking.utm_medium || tracking.medium || 'none',
        campaign: tracking.utm_campaign || tracking.campaign || 'none',
      }
    })

    return NextResponse.json({ orders })
  } catch (err) {
    console.error('[v0] /api/analytics/sales exception:', err)
    return NextResponse.json({ orders: [], error: 'internal' }, { status: 500 })
  }
}
