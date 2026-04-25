import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !serviceKey) {
    return null
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

// GET - Listar pedidos
export async function GET() {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ orders: [] })
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao listar pedidos:', error)
    return NextResponse.json({ orders: [], error: error.message })
  }
  return NextResponse.json({ orders: data || [] })
}

// POST - Criar novo pedido
export async function POST(req: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const orderId = body.id || `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const order = {
      id: orderId,
      customer_name: body.customer_name || body.customerName || '',
      customer_email: body.customer_email || body.customerEmail || '',
      customer_phone: body.customer_phone || body.customerPhone || '',
      customer_document: body.customer_document || body.customerDocument || '',
      customer_ip: body.customer_ip || body.customerIp || '',
      total: Number(body.total) || 0,
      status: body.status || 'pending',
      payment_method: body.payment_method || body.paymentMethod || 'manual',
      pix_transaction_id: body.pix_transaction_id || body.pixTransactionId || null,
      paid_at: body.paid_at || (body.status === 'paid' ? new Date().toISOString() : null),
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar pedido:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}

// PUT - Atualizar pedido
export async function PUT(req: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID nao informado' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar pedido:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}

// DELETE - Remover pedido
export async function DELETE(req: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase nao configurado' }, { status: 500 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID nao informado' }, { status: 400 })
  }

  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
