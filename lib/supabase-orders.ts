import { getSupabase, isSupabaseConfigured } from './supabase'
import type { CartItem } from './cart-store'

export interface OrderInput {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerDocument?: string
  addressRaw?: string
  city?: string
  postalCode?: string
  subtotal: number
  shipping: number
  discount: number
  total: number
  paymentMethod?: string
  status?: string
  items: CartItem[]
  tracking?: Record<string, string>
  attendantName?: string | null
}

export async function createOrder(order: OrderInput): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null

  const trackingObj =
    order.tracking && typeof order.tracking === 'object' ? order.tracking : {}

  // Resumo legivel dos campos que nao tem coluna propria, salvo em notes
  const notesPayload = JSON.stringify({
    address_raw: order.addressRaw ?? null,
    city: order.city ?? null,
    postal_code: order.postalCode ?? null,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
  })

  const itemsPayload = order.items.map((item) => ({
    product_id: item.productId,
    name: item.name,
    category: item.category,
    unit_price: item.price,
    quantity: item.quantity,
    image: item.image ?? null,
  }))

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: order.customerName ?? null,
      customer_email: order.customerEmail ?? null,
      customer_phone: order.customerPhone ?? null,
      customer_document: order.customerDocument ?? null,
      total: order.total,
      payment_method: order.paymentMethod ?? null,
      status: order.status ?? 'pending',
      items: itemsPayload,
      notes: notesPayload,
      tracking: trackingObj,
      attendant_name: order.attendantName ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('order push failed:', error.message)
    return null
  }

  return (data?.id as string) ?? null
}
