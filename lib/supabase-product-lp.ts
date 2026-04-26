import { getSupabase } from '@/lib/supabase'

export interface ProductLP {
  productId: string
  enabled: boolean
  headline: string | null
  subheadline: string | null
  heroImage: string | null
  gallery: string[]
  videoUrl: string | null
  benefits: { title: string; description?: string }[]
  longDescription: string | null
  ctaText: string | null
  ctaMessage: string | null
  seoTitle: string | null
  seoDescription: string | null
  updatedAt: string | null
}

interface DbRow {
  product_id: string
  enabled: boolean
  headline: string | null
  subheadline: string | null
  hero_image: string | null
  gallery: unknown
  video_url: string | null
  benefits: unknown
  long_description: string | null
  cta_text: string | null
  cta_message: string | null
  seo_title: string | null
  seo_description: string | null
  updated_at: string | null
}

const TABLE = 'product_landing_pages'

function rowToLP(row: DbRow): ProductLP {
  return {
    productId: row.product_id,
    enabled: row.enabled,
    headline: row.headline,
    subheadline: row.subheadline,
    heroImage: row.hero_image,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    videoUrl: row.video_url,
    benefits: Array.isArray(row.benefits)
      ? (row.benefits as { title: string; description?: string }[])
      : [],
    longDescription: row.long_description,
    ctaText: row.cta_text,
    ctaMessage: row.cta_message,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    updatedAt: row.updated_at,
  }
}

export async function getProductLP(productId: string): Promise<ProductLP | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('product_id', productId)
    .maybeSingle()
  if (error) {
    console.error('[product-lp] getProductLP', error)
    return null
  }
  if (!data) return null
  return rowToLP(data as unknown as DbRow)
}

export async function listEnabledProductLPs(): Promise<ProductLP[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('enabled', true)
  if (error) {
    console.error('[product-lp] listEnabledProductLPs', error)
    return []
  }
  return (data as unknown as DbRow[]).map(rowToLP)
}

export interface SaveLPInput {
  productId: string
  enabled: boolean
  headline?: string | null
  subheadline?: string | null
  heroImage?: string | null
  gallery?: string[]
  videoUrl?: string | null
  benefits?: { title: string; description?: string }[]
  longDescription?: string | null
  ctaText?: string | null
  ctaMessage?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}

export async function saveProductLP(input: SaveLPInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase nao configurado' }
  const payload = {
    product_id: input.productId,
    enabled: input.enabled,
    headline: input.headline ?? null,
    subheadline: input.subheadline ?? null,
    hero_image: input.heroImage ?? null,
    gallery: input.gallery ?? [],
    video_url: input.videoUrl ?? null,
    benefits: input.benefits ?? [],
    long_description: input.longDescription ?? null,
    cta_text: input.ctaText ?? null,
    cta_message: input.ctaMessage ?? null,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'product_id' })
  if (error) {
    console.error('[product-lp] saveProductLP', error)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function deleteProductLP(productId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase nao configurado' }
  const { error } = await supabase.from(TABLE).delete().eq('product_id', productId)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
