import { NextRequest, NextResponse } from 'next/server'
import { isIpBlocked } from '@/lib/supabase-ip-blocks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/ip-blocks/check?ip=1.2.3.4
 * Resposta: { blocked: boolean, expiresAt?: string }
 *
 * Endpoint leve usado pelo middleware para decidir se bloqueia
 * acesso ao checkout / PIX. Se nao houver IP, considera nao-bloqueado.
 */
export async function GET(request: NextRequest) {
  const ip = (request.nextUrl.searchParams.get('ip') || '').trim()
  if (!ip) {
    return NextResponse.json({ blocked: false })
  }

  try {
    const blocked = await isIpBlocked(ip)
    return NextResponse.json(
      { blocked },
      {
        headers: {
          // Cache curto para reduzir latencia do middleware
          'Cache-Control': 'public, max-age=30, s-maxage=30',
        },
      },
    )
  } catch (error) {
    console.error('[ip-blocks/check] erro:', error)
    // Em caso de erro nao bloqueia (fail-open) para nao derrubar o checkout
    return NextResponse.json({ blocked: false, error: true })
  }
}
