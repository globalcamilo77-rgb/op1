import { NextRequest, NextResponse } from 'next/server'

const ADMIN_SESSION_COOKIE = 'alfa-admin-session'

/**
 * Rotas que sao bloqueadas se o IP do cliente estiver na blocklist
 * (ex.: depois de PIX aprovado). Inclui checkout / pix / finalizacao
 * de pedido. NAO inclui /loja, /cidade, etc., porque queremos que
 * o cliente continue navegando livremente.
 */
const IP_BLOCKED_ROUTES = ['/checkout', '/pix', '/finalizar', '/pagamento']

/**
 * User-Agents conhecidos de bots maliciosos ou scrapers
 */
const BOT_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'axios', 'node-fetch', 'go-http-client', 'java/', 'apache-httpclient',
  'scrapy', 'headless', 'phantom', 'selenium', 'puppeteer', 'playwright',
  'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'petalbot', 'bytespider',
  'gptbot', 'ccbot', 'claudebot', 'anthropic', 'dataforseo', 'zoominfobot',
]

/**
 * User-Agents permitidos (bots bons como Google, Bing, etc.)
 */
const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp', 'baiduspider',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'whatsapp', 'telegram',
]

/**
 * Verifica se o User-Agent e de um bot malicioso
 */
function isMaliciousBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  
  // Permite bots conhecidos (Google, Bing, etc.)
  if (ALLOWED_BOTS.some(bot => ua.includes(bot))) {
    return false
  }
  
  // Bloqueia bots maliciosos conhecidos
  if (BOT_USER_AGENTS.some(bot => ua.includes(bot))) {
    return true
  }
  
  // Bloqueia se nao tiver User-Agent ou for muito curto (< 10 chars)
  if (!userAgent || userAgent.length < 10) {
    return true
  }
  
  return false
}

/**
 * Extrai o IP real do cliente respeitando proxies (Vercel manda
 * x-real-ip e x-forwarded-for). Se nada existir, devolve string vazia
 * para que o middleware faca fail-open.
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
  const userAgent = req.headers.get('user-agent') || ''

  // 0) Bloqueio de bots maliciosos em rotas sensiveis
  const isSensitiveRoute = IP_BLOCKED_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isSensitiveRoute && isMaliciousBot(userAgent)) {
    // Retorna 403 para bots em rotas de checkout/pagamento
    return new NextResponse('Acesso negado', { status: 403 })
  }

  // 1) Protecao do admin
  if (pathname.startsWith('/adminlr')) {
    const session = req.cookies.get(ADMIN_SESSION_COOKIE)
    if (!session?.value) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2) Bloqueio de IP em rotas sensiveis (checkout / PIX)
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
