'use client'

import Link from 'next/link'
import { useAddressStore } from '@/lib/address-store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { ShieldCheck, Truck, Star, ArrowRight, MessageCircle } from 'lucide-react'

const trustBadges = [
  { icon: Star, text: 'Nota 9.7 Reclame Aqui' },
  { icon: ShieldCheck, text: 'Compra 100% Segura' },
  { icon: Truck, text: 'Entrega Expressa' },
]

export function HeroSection() {
  const { openDialog } = useAddressStore()
  const registerClickAndGetContact = useWhatsAppStore((s) => s.registerClickAndGetContact)
  const trackEvent = useAnalyticsStore((s) => s.trackEvent)

  const handleWhatsAppClick = () => {
    const contact = registerClickAndGetContact()
    if (!contact) return
    trackEvent('lead', { meta: { type: 'hero_whatsapp_click' } })
    const msg = 'Ola! Vi o site e gostaria de mais informacoes sobre os produtos.'
    window.open(
      `https://wa.me/${contact.number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <section className="relative overflow-hidden bg-[var(--graphite)] text-white">
      {/* Orange roof accent - evokes the logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-[520px] w-[520px] rounded-full bg-[var(--orange-primary)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-32 h-[420px] w-[420px] rounded-full bg-[var(--orange-primary)]/10 blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[var(--orange-primary)]/15 border border-[var(--orange-primary)]/30 text-[var(--orange-primary)]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--orange-primary)]" />
              Marketplace de Materiais de Construção
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] mt-5">
              Materiais de construção{' '}
              <span className="text-[var(--orange-primary)]">mais baratos</span>{' '}
              da sua região
            </h1>

            <p className="text-lg text-white/80 mt-5 leading-relaxed max-w-xl">
              Compare preços de dezenas de lojas locais e receba direto na sua
              obra. Rápido, seguro e sem sair de casa.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/loja#produtos"
                className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-7 py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-[var(--orange-primary)]/30 transition-all hover:shadow-xl hover:shadow-[var(--orange-primary)]/40 hover:-translate-y-0.5"
              >
                Ver Produtos Agora
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => openDialog()}
                className="border-2 border-white/25 hover:border-white/50 text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Verificar Entrega na Minha Região
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8">
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/70">
                  <Icon size={16} className="text-[var(--orange-primary)]" />
                  <span>{text}</span>
                </div>
              ))}
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 text-sm text-white bg-[#25D366] hover:bg-[#20b858] px-4 py-2 rounded-full font-semibold transition-colors"
              >
                <MessageCircle size={16} />
                Fale Conosco
              </button>
            </div>
          </div>

          {/* Stats card - grafite slab with orange accent */}
          <div className="relative">
            <div className="absolute -top-3 -left-3 h-full w-full rounded-2xl bg-[var(--orange-primary)] opacity-60 blur-sm" />
            <div className="relative rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 grid grid-cols-2 gap-5">
              <Stat value="67k+" label="Pedidos entregues" />
              <Stat value="63" label="Cidades atendidas" />
              <Stat value="127+" label="Lojistas parceiros" />
              <Stat value="3,4k+" label="Clientes ativos" />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle orange bottom stripe - roof line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--orange-primary)] to-transparent" />
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--orange-primary)]">
        {value}
      </div>
      <div className="text-xs md:text-sm text-white/70 mt-1">{label}</div>
    </div>
  )
}
