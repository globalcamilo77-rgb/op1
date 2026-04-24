import { getSupabase } from './supabase'
import type { AppearanceSettings } from './appearance-store'

const TABLE = 'appearance_settings'

type AppearanceRow = {
  id: number
  brand_name: string
  brand_highlight: string
  brand_suffix: string
  logo_url: string | null
  primary_color: string
  primary_dark_color: string
  notification_bar_enabled: boolean
  notification_bar_text: string
  featured_eyebrow: string
  featured_title: string
  featured_subtitle: string
  footer_company: string
  footer_copyright: string
  footer_phone: string
  footer_whatsapp: string
  footer_email: string
}

function rowToSettings(row: AppearanceRow): AppearanceSettings {
  return {
    brandName: row.brand_name,
    brandHighlight: row.brand_highlight,
    brandSuffix: row.brand_suffix,
    logoUrl: row.logo_url ?? '',
    primaryColor: row.primary_color,
    primaryDarkColor: row.primary_dark_color,
    notificationBarEnabled: row.notification_bar_enabled,
    notificationBarText: row.notification_bar_text,
    featuredEyebrow: row.featured_eyebrow,
    featuredTitle: row.featured_title,
    featuredSubtitle: row.featured_subtitle,
    footerCompany: row.footer_company,
    footerCopyright: row.footer_copyright,
    footerPhone: row.footer_phone,
    footerWhatsapp: row.footer_whatsapp,
    footerEmail: row.footer_email,
  }
}

export async function fetchAppearance(): Promise<AppearanceSettings | null> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { data, error } = await supabase.from(TABLE).select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  if (!data) return null
  return rowToSettings(data as AppearanceRow)
}

export async function upsertAppearance(settings: AppearanceSettings): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const payload = {
    id: 1,
    brand_name: settings.brandName,
    brand_highlight: settings.brandHighlight,
    brand_suffix: settings.brandSuffix,
    logo_url: settings.logoUrl || null,
    primary_color: settings.primaryColor,
    primary_dark_color: settings.primaryDarkColor,
    notification_bar_enabled: settings.notificationBarEnabled,
    notification_bar_text: settings.notificationBarText,
    featured_eyebrow: settings.featuredEyebrow,
    featured_title: settings.featuredTitle,
    featured_subtitle: settings.featuredSubtitle,
    footer_company: settings.footerCompany,
    footer_copyright: settings.footerCopyright,
    footer_phone: settings.footerPhone,
    footer_whatsapp: settings.footerWhatsapp,
    footer_email: settings.footerEmail,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' })
  if (error) throw error
}
