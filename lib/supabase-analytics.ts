import { getSupabase, isSupabaseConfigured } from './supabase'
import type { AdSpend, AnalyticsEvent } from './analytics-store'

const TABLE_EVENTS = 'analytics_events'
const TABLE_SPENDS = 'ad_spends'

function eventToRow(event: AnalyticsEvent) {
  return {
    id: event.id,
    type: event.type,
    value: event.value,
    meta: event.meta ?? {},
    source: event.source,
    medium: event.medium,
    campaign: event.campaign,
    path: event.path,
    session_id: event.sessionId,
    ts: new Date(event.ts).toISOString(),
  }
}

export async function pushAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return

  const { error } = await supabase.from(TABLE_EVENTS).insert(eventToRow(event))
  if (error) {
    if (typeof console !== 'undefined') {
      console.warn('analytics push failed:', error.message)
    }
  }
}

export async function pushAnalyticsEventsBulk(events: AnalyticsEvent[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')
  if (events.length === 0) return

  const chunkSize = 500
  for (let i = 0; i < events.length; i += chunkSize) {
    const chunk = events.slice(i, i + chunkSize).map(eventToRow)
    const { error } = await supabase.from(TABLE_EVENTS).upsert(chunk, { onConflict: 'id' })
    if (error) throw error
  }
}

export async function fetchAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { data, error } = await supabase
    .from(TABLE_EVENTS)
    .select('*')
    .order('ts', { ascending: false })
    .limit(2000)

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    type: row.type as AnalyticsEvent['type'],
    value: Number(row.value),
    meta: (row.meta ?? {}) as AnalyticsEvent['meta'],
    source: row.source as string,
    medium: row.medium as string,
    campaign: row.campaign as string,
    path: row.path as string,
    sessionId: row.session_id as string,
    ts: new Date(row.ts as string).getTime(),
  }))
}

export async function upsertAdSpends(spends: AdSpend[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')
  if (spends.length === 0) return

  const payload = spends.map((s) => ({
    id: s.id,
    campaign: s.campaign,
    source: s.source,
    amount: s.amount,
    start_date: s.startDate,
    end_date: s.endDate,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from(TABLE_SPENDS).upsert(payload, { onConflict: 'id' })
  if (error) throw error
}

export async function fetchAdSpends(): Promise<AdSpend[]> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { data, error } = await supabase.from(TABLE_SPENDS).select('*').order('created_at', {
    ascending: false,
  })
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    campaign: row.campaign as string,
    source: row.source as string,
    amount: Number(row.amount),
    startDate: row.start_date as string,
    endDate: row.end_date as string,
  }))
}
