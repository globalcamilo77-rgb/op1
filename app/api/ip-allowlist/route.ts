import { NextResponse } from 'next/server'
import { addAllowlist, listAllowlist, removeAllowlist } from '@/lib/supabase-ip-allowlist'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const items = await listAllowlist()
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ items: [], error: String(error) }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ip?: string; label?: string }
    if (!body.ip) {
      return NextResponse.json({ error: 'ip obrigatorio' }, { status: 400 })
    }
    const item = await addAllowlist({ ip: body.ip, label: body.label })
    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ item: null, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id obrigatorio' }, { status: 400 })
    }
    const ok = await removeAllowlist(id)
    return NextResponse.json({ ok })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
