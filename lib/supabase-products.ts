import { getSupabase } from './supabase'
import type { StoreProduct } from './products-store'

const TABLE = 'products'

type ProductRow = {
  id: string
  name: string
  category: string
  subcategory: string | null
  price: number
  stock: number
  description: string | null
  image: string | null
  active: boolean
}

function rowToProduct(row: ProductRow): StoreProduct {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    price: Number(row.price),
    stock: Number(row.stock),
    description: row.description ?? '',
    image: row.image ?? '',
    active: row.active,
  }
}

function productToRow(product: StoreProduct): ProductRow {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory ?? null,
    price: product.price,
    stock: product.stock,
    description: product.description ?? null,
    image: product.image ?? null,
    active: product.active,
  }
}

export async function listProducts(): Promise<StoreProduct[]> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data as ProductRow[]).map(rowToProduct)
}

export async function upsertProducts(products: StoreProduct[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')
  if (products.length === 0) return

  const payload = products.map(productToRow)
  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' })

  if (error) throw error
}

export async function removeProductRemote(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase nao configurado')

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
