import { NextRequest, NextResponse } from 'next/server'
import { isIpAllowed } from '@/lib/supabase-ip-allowlist'
import { isIpBlocked } from '@/lib/supabase-ip-blocks'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return ''
}

/**
 * GET /api/whoami
 * Retorna o IP que o servidor enxerga + se esta na allowlist / blocklist.
 * Usado pelo painel /adminlr/atendimento para o admin saber se ele
 * proprio esta camuflado.
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || ''
  const [allowed, blocked] = await Promise.all([
    ip ? isIpAllowed(ip) : Promise.resolve(false),
    ip ? isIpBlocked(ip) : Promise.resolve(false),
  ])
  return NextResponse.json(
    { ip, userAgent, allowed, blocked },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
