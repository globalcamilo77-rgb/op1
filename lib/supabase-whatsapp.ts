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

export async function upsertWhatsAppContacts(contacts: WhatsAppContact[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')
  if (contacts.length === 0) return

  const { error } = await supabase.from(TABLE_CONTACTS).upsert(
    contacts.map((c) => ({
      id: c.id,
      label: c.label,
      number: c.number,
      active: c.active,
    })),
    { onConflict: 'id' },
  )
  if (error) throw error
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
