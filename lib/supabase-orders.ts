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

  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: order.customerName ?? null,
      customer_email: order.customerEmail ?? null,
      customer_phone: order.customerPhone ?? null,
      customer_document: order.customerDocument ?? null,
      address_raw: order.addressRaw ?? null,
      city: order.city ?? null,
      postal_code: order.postalCode ?? null,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      payment_method: order.paymentMethod ?? null,
      status: order.status ?? 'pending',
      tracking: trackingObj,
      attendant_name: order.attendantName ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('order push failed:', error.message)
    return null
  }

  const orderId = data?.id as string
  if (!orderId || order.items.length === 0) return orderId

  const itemsPayload = order.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    name: item.name,
    category: item.category,
    unit_price: item.price,
    quantity: item.quantity,
    image: item.image ?? null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload)
  if (itemsError) {
    console.warn('order_items push failed:', itemsError.message)
  }

  return orderId
}
