import { NextRequest, NextResponse } from 'next/server'
import {
  deleteProductLP,
  getProductLP,
  saveProductLP,
} from '@/lib/supabase-product-lp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const lp = await getProductLP(productId)
  return NextResponse.json({ lp })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const body = await req.json()
  const result = await saveProductLP({ ...body, productId })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params
  const result = await deleteProductLP(productId)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
