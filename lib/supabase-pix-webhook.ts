import { getSupabase } from './supabase'

export type PixWebhookEvent = 'pix_gerado' | 'pix_aprovado' | 'pix_expirado' | 'pix_cancelado' | 'test'

export interface PixWebhookLog {
  id: string
  eventType: PixWebhookEvent | string
  status: string
  payload: Record<string, unknown>
  clientIp: string | null
  userAgent: string | null
  pixId: string | null
  amount: number | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  ipBlockId: string | null
  processedAt: string | null
  createdAt: string
}

interface PixWebhookLogRow {
  id: string
  event_type: string
  status: string
  payload: Record<string, unknown>
  client_ip: string | null
  user_agent: string | null
  pix_id: string | null
  amount: number | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  ip_block_id: string | null
  processed_at: string | null
  created_at: string
}

const TABLE = 'pix_webhook_log'

function rowToLog(row: PixWebhookLogRow): PixWebhookLog {
  return {
    id: row.id,
    eventType: row.event_type,
    status: row.status,
    payload: row.payload || {},
    clientIp: row.client_ip,
    userAgent: row.user_agent,
    pixId: row.pix_id,
    amount: row.amount,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    ipBlockId: row.ip_block_id,
    processedAt: row.processed_at,
    createdAt: row.created_at,
  }
}

export async function logPixWebhook(input: {
  eventType: PixWebhookEvent | string
  status?: string
  payload: Record<string, unknown>
  clientIp?: string | null
  userAgent?: string | null
  pixId?: string | null
  amount?: number | null
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  ipBlockId?: string | null
}): Promise<PixWebhookLog | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      event_type: input.eventType,
      status: input.status || 'received',
      payload: input.payload || {},
      client_ip: input.clientIp ?? null,
      user_agent: input.userAgent ?? null,
      pix_id: input.pixId ?? null,
      amount: input.amount ?? null,
      customer_name: input.customerName ?? null,
      customer_email: input.customerEmail ?? null,
      customer_phone: input.customerPhone ?? null,
      ip_block_id: input.ipBlockId ?? null,
      processed_at: new Date().toISOString(),
    })
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('[pix-webhook] erro registrando:', error)
    return null
  }
  return data ? rowToLog(data as PixWebhookLogRow) : null
}

export async function listRecentWebhooks(limit = 50): Promise<PixWebhookLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[pix-webhook] erro listando:', error)
    return []
  }
  return (data as PixWebhookLogRow[]).map(rowToLog)
}
