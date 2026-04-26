import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DailyPoint {
  date: string
  orders: number
  revenue: number
  leads: number
  pixApproved: number
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 503 })
  }

  const days = Math.min(
    Math.max(parseInt(request.nextUrl.searchParams.get('days') || '30', 10), 1),
    180,
  )

  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCDate(since.getUTCDate() - (days - 1))
  const sinceIso = since.toISOString()

  // Buscar tudo em paralelo
  const [ordersRes, leadsRes, pixRes, blocksRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total, created_at, status')
      .gte('created_at', sinceIso)
      .limit(5000),
    supabase
      .from('leads')
      .select('id, created_at')
      .gte('created_at', sinceIso)
      .limit(5000),
    supabase
      .from('pix_webhook_log')
      .select('id, event_type, amount, created_at')
      .eq('event_type', 'pix_aprovado')
      .gte('created_at', sinceIso)
      .limit(5000),
    supabase
      .from('ip_blocks')
      .select('id, ip, expires_at, created_at, manual')
      .limit(5000),
  ])

  const orders = ((ordersRes.data ?? []) as unknown as Array<{
    id: string
    total: number | null
    created_at: string
    status: string | null
  }>)
  const leads = ((leadsRes.data ?? []) as unknown as Array<{ id: string; created_at: string }>)
  const pixApproved = ((pixRes.data ?? []) as unknown as Array<{
    id: string
    amount: number | null
    created_at: string
  }>)
  const ipBlocks = ((blocksRes.data ?? []) as unknown as Array<{
    id: string
    expires_at: string | null
    manual: boolean | null
  }>)

  // Bucket diario (UTC)
  const buckets = new Map<string, DailyPoint>()
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setUTCDate(d.getUTCDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, { date: key, orders: 0, revenue: 0, leads: 0, pixApproved: 0 })
  }

  for (const o of orders) {
    const key = o.created_at.slice(0, 10)
    const b = buckets.get(key)
    if (!b) continue
    b.orders += 1
    b.revenue += Number(o.total ?? 0)
  }
  for (const l of leads) {
    const key = l.created_at.slice(0, 10)
    const b = buckets.get(key)
    if (b) b.leads += 1
  }
  for (const p of pixApproved) {
    const key = p.created_at.slice(0, 10)
    const b = buckets.get(key)
    if (b) b.pixApproved += 1
  }

  const series = Array.from(buckets.values())

  const totals = {
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
    leads: leads.length,
    pixApproved: pixApproved.length,
    activeIpBlocks: ipBlocks.filter(
      (b) => !b.expires_at || new Date(b.expires_at).getTime() > Date.now(),
    ).length,
    manualBlocks: ipBlocks.filter((b) => b.manual === true).length,
  }

  return NextResponse.json({ days, series, totals })
}
