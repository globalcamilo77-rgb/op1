import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'alfa-admin-session'

/**
 * Rotas que verificam se o IP esta na blocklist MANUAL
 * (voce decide quem bloquear no admin)
 */
const IP_BLOCKED_ROUTES = ['/checkout', '/pix', '/finalizar', '/pagamento']

/**
 * Extrai o IP real do cliente respeitando proxies (Vercel manda
 * x-real-ip e x-forwarded-for). Se nada existir, devolve string vazia.
 */
function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return ''
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Protecao do admin
  if (pathname.startsWith('/adminlr')) {
    const session = req.cookies.get(ADMIN_SESSION_COOKIE)
    if (!session?.value) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2) Bloqueio de IP MANUAL em rotas sensiveis (checkout / PIX)
  // So bloqueia IPs que VOCE adicionou manualmente no admin
  const isBlockedRoute = IP_BLOCKED_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isBlockedRoute) {
    const ip = getClientIp(req)
    if (ip) {
      try {
        const checkUrl = new URL('/api/ip-blocks/check', req.nextUrl.origin)
        checkUrl.searchParams.set('ip', ip)
        const res = await fetch(checkUrl, { cache: 'no-store' })
        if (res.ok) {
          const json = (await res.json()) as { blocked?: boolean }
          if (json?.blocked) {
            const blockedUrl = req.nextUrl.clone()
            blockedUrl.pathname = '/blocked'
            return NextResponse.redirect(blockedUrl)
          }
        }
      } catch {
        // fail-open: deixa passar se a checagem falhar
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/adminlr/:path*',
    '/checkout/:path*',
    '/pix/:path*',
    '/finalizar/:path*',
    '/pagamento/:path*',
  ],
}
