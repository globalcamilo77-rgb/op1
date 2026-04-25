import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - Buscar todos os produtos
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: data || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST - Criar ou atualizar produtos (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Products array required' }, { status: 400 })
    }

    const supabase = getSupabase()
    
    // Upsert all products
    const { data, error } = await supabase
      .from('products')
      .upsert(products.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory || null,
        brand: p.brand || null,
        dimensions: p.dimensions || null,
        price: p.price || 0,
        stock: p.stock || 0,
        description: p.description || null,
        image: p.image || null,
        active: p.active !== false,
      })), { onConflict: 'id' })
      .select()

    if (error) {
      console.error('Error upserting products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: data?.length || 0 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to save products' }, { status: 500 })
  }
}

// PUT - Atualizar um produto específico
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const supabase = getSupabase()
    
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        category: updates.category,
        subcategory: updates.subcategory || null,
        brand: updates.brand || null,
        dimensions: updates.dimensions || null,
        price: updates.price || 0,
        stock: updates.stock || 0,
        description: updates.description || null,
        image: updates.image || null,
        active: updates.active !== false,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE - Deletar um produto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const supabase = getSupabase()
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
