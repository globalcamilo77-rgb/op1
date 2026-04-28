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
 * Rate limiting em memoria (Edge Runtime)
 * Map<IP, { count: number, firstRequest: number, blocked: boolean }>
 */
const rateLimitMap = new Map<string, { count: number; firstRequest: number; blocked: boolean }>()

// Configuracoes de rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100 // Max 100 requests por minuto
const RATE_LIMIT_SPAM_THRESHOLD = 30 // 30 requests em 10 segundos = spam
const RATE_LIMIT_SPAM_WINDOW_MS = 10 * 1000 // 10 segundos

// Cache de IPs bloqueados (evita chamadas repetidas ao Supabase)
const blockedIpsCache = new Map<string, number>() // IP -> timestamp de quando foi bloqueado
const BLOCKED_CACHE_TTL = 5 * 60 * 1000 // 5 minutos de cache

/**
 * Verifica rate limit e detecta spam
 * Retorna: { allowed: boolean, isSpam: boolean, requestCount: number }
 */
function checkRateLimit(ip: string): { allowed: boolean; isSpam: boolean; requestCount: number } {
  const now = Date.now()
  
  // Limpa entradas antigas do cache de bloqueio
  for (const [cachedIp, blockedAt] of blockedIpsCache) {
    if (now - blockedAt > BLOCKED_CACHE_TTL) {
      blockedIpsCache.delete(cachedIp)
    }
  }
  
  // Se ja esta no cache de bloqueados, nega imediatamente
  if (blockedIpsCache.has(ip)) {
    return { allowed: false, isSpam: true, requestCount: 999 }
  }
  
  const entry = rateLimitMap.get(ip)
  
  if (!entry) {
    // Primeiro request deste IP
    rateLimitMap.set(ip, { count: 1, firstRequest: now, blocked: false })
    return { allowed: true, isSpam: false, requestCount: 1 }
  }
  
  // Se ja foi marcado como bloqueado nesta sessao
  if (entry.blocked) {
    return { allowed: false, isSpam: true, requestCount: entry.count }
  }
  
  // Reseta janela se passou o tempo
  if (now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now, blocked: false })
    return { allowed: true, isSpam: false, requestCount: 1 }
  }
  
  // Incrementa contador
  entry.count++
  
  // Detecta SPAM: muitos requests em pouco tempo
  const timeSinceFirst = now - entry.firstRequest
  if (timeSinceFirst < RATE_LIMIT_SPAM_WINDOW_MS && entry.count > RATE_LIMIT_SPAM_THRESHOLD) {
    entry.blocked = true
    blockedIpsCache.set(ip, now) // Adiciona ao cache de bloqueados
    return { allowed: false, isSpam: true, requestCount: entry.count }
  }
  
  // Rate limit normal (100 req/min)
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, isSpam: false, requestCount: entry.count }
  }
  
  return { allowed: true, isSpam: false, requestCount: entry.count }
}

/**
 * Bloqueia IP no Supabase de forma assincrona (fire-and-forget)
 */
async function blockIpInDatabase(ip: string, reason: string, req: NextRequest) {
  try {
    const blockUrl = new URL('/api/ip-blocks/add', req.nextUrl.origin)
    await fetch(blockUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip,
        reason,
        metadata: {
          userAgent: req.headers.get('user-agent'),
          path: req.nextUrl.pathname,
          blockedAt: new Date().toISOString(),
        },
      }),
    })
  } catch {
    // Ignora erros - o bloqueio em memoria ja funciona
  }
}

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
  const clientIp = getClientIp(req)

  // 0) Rate Limiting e deteccao de SPAM
  if (clientIp) {
    const rateLimit = checkRateLimit(clientIp)
    
    // Se for SPAM, bloqueia IP no banco e retorna 429
    if (rateLimit.isSpam) {
      // Bloqueia no Supabase de forma assincrona (nao espera)
      blockIpInDatabase(clientIp, 'spam_detected', req)
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Muitas requisicoes. IP bloqueado por comportamento suspeito.',
          blocked: true 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '3600', // 1 hora
          } 
        }
      )
    }
    
    // Rate limit normal (sem bloquear permanentemente)
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Muitas requisicoes. Aguarde um momento.' }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60',
          } 
        }
      )
    }
  }

  // 1) Bloqueio de bots maliciosos em rotas sensiveis
  const isSensitiveRoute = IP_BLOCKED_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (isSensitiveRoute && isMaliciousBot(userAgent)) {
    // Bloqueia IP de bot no banco
    if (clientIp) {
      blockIpInDatabase(clientIp, 'malicious_bot', req)
    }
    return new NextResponse('Acesso negado', { status: 403 })
  }

  // 2) Protecao do admin
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
    // Admin
    '/adminlr/:path*',
    // Checkout e pagamento (rate limit + bloqueio de IP)
    '/checkout/:path*',
    '/pix/:path*',
    '/finalizar/:path*',
    '/pagamento/:path*',
    // APIs sensiveis (rate limit)
    '/api/pix/:path*',
    '/api/orders/:path*',
    '/api/leads/:path*',
    // Paginas principais (rate limit leve)
    '/loja/:path*',
    '/cidade/:path*',
    '/produto/:path*',
  ],
}
