import { createClient } from '@supabase/supabase-js'

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

const TABLE = 'ip_allowlist'

export interface AllowlistedIp {
  id: string
  ip: string
  label: string
  created_at: string
}

/**
 * Verifica se o IP esta na whitelist (camuflagem do operador / admin).
 * Sempre que esta funcao retornar true, NUNCA devemos bloquear o IP, nem
 * em rotacao detectada nem em PIX aprovado. Fail-open: se a query falhar,
 * retorna false (NAO assume protecao para evitar deixar passar exploit).
 */
export async function isIpAllowed(ip: string): Promise<boolean> {
  if (!ip) return false
  const supabase = getServerClient()
  if (!supabase) return false
  const { data, error } = await supabase.from(TABLE).select('id').eq('ip', ip).maybeSingle()
  if (error) {
    console.error('[ip-allowlist] isIpAllowed erro:', error)
    return false
  }
  return Boolean(data)
}

export async function listAllowlist(): Promise<AllowlistedIp[]> {
  const supabase = getServerClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[ip-allowlist] list erro:', error)
    return []
  }
  return (data ?? []) as AllowlistedIp[]
}

export async function addAllowlist(input: { ip: string; label?: string }): Promise<AllowlistedIp | null> {
  const supabase = getServerClient()
  if (!supabase) return null
  const ip = input.ip.trim()
  if (!ip) return null
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ ip, label: input.label?.trim() || 'Admin' }, { onConflict: 'ip' })
    .select('*')
    .single()
  if (error) {
    console.error('[ip-allowlist] add erro:', error)
    return null
  }
  return data as AllowlistedIp
}

export async function removeAllowlist(id: string): Promise<boolean> {
  const supabase = getServerClient()
  if (!supabase) return false
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) {
    console.error('[ip-allowlist] remove erro:', error)
    return false
  }
  return true
}
