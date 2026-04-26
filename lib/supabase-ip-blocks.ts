import { getSupabase } from './supabase'

export interface IpBlock {
  id: string
  ip: string
  reason: string
  source: 'auto' | 'manual'
  manual: boolean
  expiresAt: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

interface IpBlockRow {
  id: string
  ip: string
  reason: string
  source: string
  manual: boolean
  expires_at: string | null
  metadata: Record<string, unknown>
  created_at: string
}

const TABLE = 'ip_blocks'

function rowToBlock(row: IpBlockRow): IpBlock {
  return {
    id: row.id,
    ip: row.ip,
    reason: row.reason,
    source: (row.source as 'auto' | 'manual') || 'auto',
    manual: Boolean(row.manual),
    expiresAt: row.expires_at,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }
}

/**
 * Bloqueia um IP. Por padrao, bloqueio automatico expira em 1 hora.
 * Bloqueio manual eh permanente (expiresAt = null).
 */
export async function addIpBlock(input: {
  ip: string
  reason?: string
  manual?: boolean
  expiresInMinutes?: number
  metadata?: Record<string, unknown>
}): Promise<IpBlock | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const ip = input.ip.trim()
  if (!ip) return null

  const expiresAt = input.manual
    ? null
    : new Date(Date.now() + (input.expiresInMinutes ?? 60) * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ip,
      reason: input.reason || 'pix_aprovado',
      source: input.manual ? 'manual' : 'auto',
      manual: Boolean(input.manual),
      expires_at: expiresAt,
      metadata: input.metadata || {},
    })
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[ip-blocks] erro inserindo bloqueio:', error)
    return null
  }
  if (!data) return null
  return rowToBlock(data as IpBlockRow)
}

export async function listActiveIpBlocks(): Promise<IpBlock[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[ip-blocks] erro listando:', error)
    return []
  }
  return (data as IpBlockRow[]).map(rowToBlock)
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip) return false
  const supabase = getSupabase()
  if (!supabase) return false

  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('ip', ip)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .limit(1)

  if (error) {
    console.error('[ip-blocks] erro verificando ip:', error)
    return false
  }
  return Array.isArray(data) && data.length > 0
}

export async function removeIpBlock(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from(TABLE).delete().eq('id', id)
}

export async function unblockIp(ip: string): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0
  const { data, error } = await supabase.from(TABLE).delete().eq('ip', ip).select('id')
  if (error) return 0
  return (data || []).length
}

export async function purgeExpiredBlocks(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .lt('expires_at', nowIso)
    .not('expires_at', 'is', null)
    .select('id')
  if (error) return 0
  return (data || []).length
}
