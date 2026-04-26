import { getSupabase } from './supabase'
import type { CityPage, CityContact } from './cities-store'

const TABLE_CITIES = 'cities'
const TABLE_CONTACTS = 'city_contacts'

interface CityRow {
  id: string
  slug: string
  city_name: string
  uf: string
  active: boolean
  hero_title: string | null
  hero_subtitle: string | null
  highlight: string | null
  cta_label: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
  updated_at: string
}

interface CityContactRow {
  id: string
  city_id: string
  label: string
  number: string
  active: boolean
  position: number
  created_at: string
}

function rowToCity(row: CityRow, contacts: CityContact[]): CityPage {
  return {
    id: row.id,
    slug: row.slug,
    cityName: row.city_name,
    state: row.uf,
    active: row.active,
    headline: row.hero_title || `Material de construcao em ${row.city_name} com entrega rapida`,
    subheadline:
      row.hero_subtitle ||
      `Cimento, argamassa e rejunte com descontos para ${row.city_name}. Frete reduzido e atendimento pelo WhatsApp.`,
    offerBadge: row.highlight || `Oferta especial para ${row.city_name}`,
    defaultMessage:
      row.cta_label?.trim() ||
      `Ola! Cheguei pela campanha de ${row.city_name} e quero um orcamento.`,
    rotationIntervalMinutes: 15,
    contacts,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function rowToContact(row: CityContactRow): CityContact {
  return {
    id: row.id,
    label: row.label,
    number: row.number,
    active: row.active,
  }
}

export async function listCities(): Promise<CityPage[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data: cityRows, error: e1 } = await supabase
    .from(TABLE_CITIES)
    .select('*')
    .order('city_name')

  if (e1) {
    console.error('[supabase-cities] erro listando cidades:', e1)
    return []
  }
  if (!cityRows || cityRows.length === 0) return []

  const ids = cityRows.map((r) => r.id as string)
  const { data: contactRows, error: e2 } = await supabase
    .from(TABLE_CONTACTS)
    .select('*')
    .in('city_id', ids)
    .order('position')

  if (e2) {
    console.error('[supabase-cities] erro listando contatos:', e2)
  }

  const contactsByCity = new Map<string, CityContact[]>()
  for (const c of (contactRows ?? []) as CityContactRow[]) {
    const list = contactsByCity.get(c.city_id) || []
    list.push(rowToContact(c))
    contactsByCity.set(c.city_id, list)
  }

  return (cityRows as CityRow[]).map((r) => rowToCity(r, contactsByCity.get(r.id) || []))
}

export async function getCityBySlug(slug: string): Promise<CityPage | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from(TABLE_CITIES)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('[supabase-cities] erro buscando slug:', error)
    return null
  }
  if (!data) return null

  const cityRow = data as CityRow

  const { data: contactRows } = await supabase
    .from(TABLE_CONTACTS)
    .select('*')
    .eq('city_id', cityRow.id)
    .order('position')

  const contacts = ((contactRows ?? []) as CityContactRow[]).map(rowToContact)
  return rowToCity(cityRow, contacts)
}

export async function upsertCity(city: CityPage): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { error } = await supabase.from(TABLE_CITIES).upsert(
    {
      id: city.id,
      slug: city.slug,
      city_name: city.cityName,
      uf: city.state || 'SP',
      active: city.active,
      hero_title: city.headline,
      hero_subtitle: city.subheadline,
      highlight: city.offerBadge,
      cta_label: city.defaultMessage,
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: `cidade-${city.slug}`,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error

  // Substitui contatos: apaga os existentes e insere os novos
  await supabase.from(TABLE_CONTACTS).delete().eq('city_id', city.id)

  if (city.contacts.length > 0) {
    const { error: e2 } = await supabase.from(TABLE_CONTACTS).insert(
      city.contacts.map((c, idx) => ({
        id: c.id,
        city_id: city.id,
        label: c.label,
        number: c.number,
        active: c.active,
        position: idx,
      })),
    )
    if (e2) throw e2
  }
}

export async function deleteCity(cityId: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { error } = await supabase.from(TABLE_CITIES).delete().eq('id', cityId)
  if (error) throw error
}

export async function bulkUpsertCities(cities: CityPage[]): Promise<void> {
  for (const c of cities) {
    await upsertCity(c)
  }
}
