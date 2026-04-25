'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Star,
  Truck,
  CreditCard,
  PackageCheck,
  ArrowRight,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import { LeadCaptureForm } from '@/components/funnel/lead-capture-form'
import { FunnelCountdown } from '@/components/funnel/funnel-countdown'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { useAppearanceStore } from '@/lib/appearance-store'

interface Funnel {
  id: string
  slug: string
  name: string
  badge: string | null
  headline: string
  subheadline: string | null
  cta_primary_text: string
  cta_secondary_text: string
  countdown_hours: number
  hero_image: string | null
  city: string | null
  whatsapp_override: string | null
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
  stat_4_value: string
  stat_4_label: string
}

const TESTIMONIALS = [
  {
    name: 'Marcelo S.',
    role: 'Engenheiro Civil',
    text: 'Recebi orcamento em menos de 10 minutos. Atendimento direto no WhatsApp resolveu tudo.',
  },
  {
    name: 'Patricia R.',
    role: 'Reformando a casa',
    text: 'Melhor preco e o frete saiu mais barato do que eu retirar pessoalmente.',
  },
  {
    name: 'Joao P.',
    role: 'Mestre de obras',
    text: 'Uso ja faz 6 meses pra todas as obras. Sempre entrega no prazo combinado.',
  },
]

export default function FunilPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)
  const brandName = useAppearanceStore((state) => state.brandName)

  const [funnel, setFunnel] = useState<Funnel | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const funnelRes = await fetch(`/api/funnels/${slug}`)
        if (!funnelRes.ok) {
          if (!cancelled) setNotFound(true)
          return
        }
        const funnelData = await funnelRes.json()
        if (cancelled || !funnelData.success) return
        setFunnel(funnelData.funnel)

        // Buscar WhatsApp do funil ou rotacionar pela cidade
        if (funnelData.funnel.whatsapp_override) {
          setWhatsappNumber(funnelData.funnel.whatsapp_override)
        } else {
          const waRes = await fetch(
            `/api/whatsapp/get?source=funnel-cidade&city=${encodeURIComponent(
              funnelData.funnel.city || '',
            )}`,
          )
          if (waRes.ok) {
            const waData = await waRes.json()
            if (!cancelled && waData.number_clean) {
              setWhatsappNumber(waData.number_clean)
            }
          }
        }

        trackEvent('page_view', {
          meta: { type: 'funnel', slug, city: funnelData.funnel.city },
        })
      } catch (error) {
        console.error('[v0] Erro ao carregar funil:', error)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug, trackEvent])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-[var(--orange-primary)]" />
      </div>
    )
  }

  if (notFound || !funnel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="text-2xl font-extrabold">Funil nao encontrado</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Verifique o link ou volte para a pagina inicial.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold px-5 py-2.5 rounded-full transition-colors"
        >
          Voltar
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Ola! Vim pela campanha "${funnel.name}" e quero um orcamento.`,
      )}`
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-foreground">
            {brandName}
          </Link>
          <Link
            href="/loja"
            className="text-sm font-bold text-[var(--orange-primary)] hover:text-[var(--orange-dark)]"
          >
            Ver loja completa
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[var(--graphite)] to-[var(--graphite-soft)] text-white py-12 md:py-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            {funnel.badge && (
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 mb-5">
                <ShieldCheck size={14} />
                {funnel.badge}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-balance">
              {funnel.headline}
            </h1>

            {funnel.subheadline && (
              <p className="text-base md:text-lg text-white/80 mt-5 max-w-xl text-pretty">
                {funnel.subheadline}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <a
                href="#orcamento"
                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--graphite)] font-extrabold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
              >
                {funnel.cta_primary_text}
                <ArrowRight size={18} />
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackEvent('lead', {
                      meta: { type: 'whatsapp_click', slug, city: funnel.city ?? '' },
                    })
                  }
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-extrabold px-6 py-3 rounded-full hover:bg-[#20b858] transition-colors"
                >
                  <MessageCircle size={18} />
                  {funnel.cta_secondary_text}
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-xs text-white/80">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {funnel.stat_4_value} - 2.300+ obras
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Pagamento 100% seguro
              </div>
            </div>

            <div className="mt-7">
              <FunnelCountdown hours={funnel.countdown_hours} />
            </div>
          </div>

          <div id="orcamento">
            <LeadCaptureForm
              source={`funnel:${slug}`}
              city={funnel.city || undefined}
              funnelSlug={slug}
              whatsappNumber={whatsappNumber || undefined}
              ctaLabel={funnel.cta_primary_text}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-secondary py-10 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { v: funnel.stat_1_value, l: funnel.stat_1_label },
            { v: funnel.stat_2_value, l: funnel.stat_2_label },
            { v: funnel.stat_3_value, l: funnel.stat_3_label },
            { v: funnel.stat_4_value, l: funnel.stat_4_label },
          ].map((stat) => (
            <div key={stat.l}>
              <div className="text-3xl md:text-4xl font-extrabold text-[var(--orange-primary)]">
                {stat.v}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {stat.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-14 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Por que comprar com a gente
            </p>
            <h2 className="text-3xl font-extrabold mt-2">
              Tudo o que sua obra precisa
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,
                title: 'Entrega rapida',
                desc: 'Frete reduzido e entrega programada em 48h para sua obra.',
              },
              {
                icon: PackageCheck,
                title: 'Produtos originais',
                desc: 'Cimento, argamassa e rejunte com nota fiscal e garantia.',
              },
              {
                icon: CreditCard,
                title: 'PIX, cartao ou boleto',
                desc: 'Parcelamos em ate 12x sem juros. Voce escolhe.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-xl border border-border shadow-sm p-6"
              >
                <div className="w-11 h-11 rounded-lg bg-[var(--orange-primary)]/10 flex items-center justify-center text-[var(--orange-primary)]">
                  <item.icon size={22} />
                </div>
                <h3 className="text-lg font-extrabold mt-4">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary py-14 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Quem confia na gente
            </p>
            <h2 className="text-3xl font-extrabold mt-2">
              Mais de 2.300 obras atendidas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-card rounded-xl border border-border shadow-sm p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground">{t.text}</p>
                <div className="mt-4">
                  <p className="text-sm font-extrabold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[var(--orange-primary)] text-white py-14 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-balance">
            Nao deixe sua obra esperando
          </h2>
          <p className="text-white/90 mt-3">
            Solicite seu orcamento agora e receba retorno em menos de 10 minutos.
          </p>
          <a
            href="#orcamento"
            className="inline-flex items-center gap-2 bg-white text-[var(--orange-dark)] font-extrabold px-6 py-3 rounded-full hover:bg-white/90 transition-colors mt-7"
          >
            Quero meu orcamento
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--graphite)] text-white/70 py-10 px-5">
        <div className="max-w-6xl mx-auto text-center text-xs">
          {new Date().getFullYear()} {brandName}. Todos os direitos reservados.
        </div>
      </footer>

      {/* CTA flutuante mobile */}
      {whatsappHref && (
        <div className="fixed bottom-4 inset-x-4 lg:hidden z-40">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-extrabold py-3.5 rounded-full shadow-2xl"
          >
            <MessageCircle size={18} />
            {funnel.cta_secondary_text}
          </a>
        </div>
      )}
    </div>
  )
}
