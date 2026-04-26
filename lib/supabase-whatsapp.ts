import { getSupabase } from './supabase'
import type { WhatsAppContact } from './whatsapp-store'

export interface WhatsAppSettings {
  defaultMessage: string
  rotationIntervalMinutes: number
}

const TABLE_CONTACTS = 'whatsapp_contacts'
const TABLE_SETTINGS = 'whatsapp_settings'

export async function listWhatsAppContacts(): Promise<WhatsAppContact[]> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { data, error } = await supabase.from(TABLE_CONTACTS).select('*').order('label')
  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    label: row.label as string,
    number: row.number as string,
    active: Boolean(row.active),
  }))
}

/**
 * Sincroniza a lista completa de contatos do WhatsApp com o Supabase.
 * Deleta os que sumiram da lista e faz upsert dos restantes. Pensado
 * para chamadas vindas do /adminlr/whatsapp depois de qualquer mudanca.
 */
export async function upsertWhatsAppContacts(contacts: WhatsAppContact[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  // 1) Apagar do banco contatos que nao estao mais na lista
  const ids = contacts.map((c) => c.id)
  if (ids.length === 0) {
    // Lista vazia: limpa toda a tabela
    const { error } = await supabase.from(TABLE_CONTACTS).delete().neq('id', '__nope__')
    if (error) throw error
    return
  }

  const { error: delError } = await supabase
    .from(TABLE_CONTACTS)
    .delete()
    .not('id', 'in', `(${ids.map((id) => `"${id.replace(/"/g, '')}"`).join(',')})`)
  if (delError) throw delError

  // 2) Upsert dos contatos atuais
  const { error: upError } = await supabase.from(TABLE_CONTACTS).upsert(
    contacts.map((c, idx) => ({
      id: c.id,
      label: c.label,
      number: c.number,
      active: c.active,
      position: idx,
    })),
    { onConflict: 'id' },
  )
  if (upError) throw upError
}

export async function fetchWhatsAppSettings(): Promise<WhatsAppSettings | null> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .select('default_message, rotation_interval_minutes')
    .eq('id', 1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    defaultMessage: data.default_message as string,
    rotationIntervalMinutes: Number(data.rotation_interval_minutes),
  }
}

export async function upsertWhatsAppSettings(settings: WhatsAppSettings): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { error } = await supabase.from(TABLE_SETTINGS).upsert(
    {
      id: 1,
      default_message: settings.defaultMessage,
      rotation_interval_minutes: settings.rotationIntervalMinutes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}
