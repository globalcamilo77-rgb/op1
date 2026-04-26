// Helper centralizado para abrir o WhatsApp na melhor URL disponivel
// para o ambiente do usuario.
//
// Por que existe: o link "wa.me/{numero}?text=..." funciona perfeitamente
// em mobile (abre o app), mas em desktop ele redireciona para
// "api.whatsapp.com/send/?phone=...&type=phone_number&app_absent=0",
// que pode falhar em proxies / VPNs / redes corporativas que nao tem
// rota para api.whatsapp.com (ex.: AdsPower, navegadores anti-deteccao).
//
// Solucao: gerar a URL ja na sua forma final em cada ambiente.
//   - Desktop -> web.whatsapp.com/send?phone=X&text=Y (abre WhatsApp Web direto)
//   - Mobile  -> wa.me/X?text=Y (abre o app instalado direto)

const sanitizeNumber = (n: string) => (n || '').replace(/\D/g, '')

const isMobileUA = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini/i.test(navigator.userAgent || '')
}

/**
 * URL universal de fallback (server-safe). Usa wa.me, que funciona em qualquer
 * ambiente sem JS. Use em <a href="..."> quando precisa de SSR.
 */
export function buildWhatsAppUrl(number: string, text?: string): string {
  const clean = sanitizeNumber(number)
  if (!clean) return '#'
  const t = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${clean}${t}`
}

/**
 * URL otimizada para o ambiente atual (so funciona client-side).
 * - Mobile: wa.me (abre app direto)
 * - Desktop: web.whatsapp.com/send (abre WhatsApp Web direto, sem redirect)
 */
export function buildSmartWhatsAppUrl(number: string, text?: string): string {
  const clean = sanitizeNumber(number)
  if (!clean) return '#'

  if (isMobileUA()) {
    const t = text ? `?text=${encodeURIComponent(text)}` : ''
    return `https://wa.me/${clean}${t}`
  }

  const params = new URLSearchParams({ phone: clean })
  if (text) params.set('text', text)
  return `https://web.whatsapp.com/send?${params.toString()}`
}

/**
 * Abre o WhatsApp na melhor URL para o ambiente atual.
 * Sempre prefira essa funcao em onClick handlers de botoes "Falar no WhatsApp".
 */
export function openWhatsApp(number: string, text?: string): void {
  if (typeof window === 'undefined') return
  const url = buildSmartWhatsAppUrl(number, text)
  if (url === '#') return
  window.open(url, '_blank', 'noopener,noreferrer')
}
