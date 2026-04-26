import { NextResponse } from 'next/server'
import {
  addIpBlock,
  listActiveIpBlocks,
  removeIpBlock,
  unblockIp,
} from '@/lib/supabase-ip-blocks'
import { isIpAllowed } from '@/lib/supabase-ip-allowlist'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const blocks = await listActiveIpBlocks()
    return NextResponse.json({ blocks }, { status: 200 })
  } catch (error) {
    console.error('[api/ip-blocks] GET falhou:', error)
    return NextResponse.json({ blocks: [], error: String(error) }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ip: string
      reason?: string
      manual?: boolean
      expiresInMinutes?: number
      metadata?: Record<string, unknown>
    }
    if (!body.ip) {
      return NextResponse.json({ error: 'ip obrigatorio' }, { status: 400 })
    }
    // Camuflagem: nao deixa nem o admin se auto-bloquear se o IP estiver na allowlist
    const allowed = await isIpAllowed(body.ip)
    if (allowed) {
      return NextResponse.json(
        {
          block: null,
          error: 'IP esta na allowlist (camuflagem) e nao pode ser bloqueado. Remova da allowlist primeiro.',
        },
        { status: 409 },
      )
    }
    const block = await addIpBlock(body)
    return NextResponse.json({ block }, { status: 200 })
  } catch (error) {
    console.error('[api/ip-blocks] POST falhou:', error)
    return NextResponse.json({ block: null, error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const ip = searchParams.get('ip')
    if (id) {
      await removeIpBlock(id)
      return NextResponse.json({ ok: true, removed: 1 }, { status: 200 })
    }
    if (ip) {
      const removed = await unblockIp(ip)
      return NextResponse.json({ ok: true, removed }, { status: 200 })
    }
    return NextResponse.json({ error: 'id ou ip obrigatorio' }, { status: 400 })
  } catch (error) {
    console.error('[api/ip-blocks] DELETE falhou:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
