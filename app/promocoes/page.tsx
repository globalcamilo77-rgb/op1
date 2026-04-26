import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgePercent, Truck, ShieldCheck, Tag, Clock } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { CountdownClient } from './countdown-client'

export const metadata: Metadata = {
  title: 'Promoções da semana · AlfaConstrução',
  description:
    'Pacote de descontos exclusivos para sua obra: cimento, argamassa, ferro e mais com até 35% OFF e PIX com 5% extra.',
}

const PROMOS = [
  {
    badge: '35% OFF',
    title: 'Saco de cimento CP-II 50kg',
    note: 'Pague 12x sem juros ou 5% OFF no PIX',
    accent: 'bg-[var(--orange-primary)]',
  },
  {
    badge: '28% OFF',
    title: 'Argamassa AC-III 20kg',
    note: 'Frete reduzido para sua região',
    accent: 'bg-[var(--orange-dark)]',
  },
  {
    badge: 'COMBO',
    title: 'Kit reforma rápida',
    note: 'Cimento + argamassa + rejunte com 22% OFF',
    accent: 'bg-emerald-600',
  },
  {
    badge: '15% OFF',
    title: 'Ferro 5/16 - 6,3 mm',
    note: 'Estoque limitado · entrega em 48h',
    accent: 'bg-rose-600',
  },
]

export default function PromocoesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--graphite)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-[420px] w-[420px] rounded-full bg-[var(--orange-primary)]/30 blur-3xl"
        />
        <div className="relative max-w-6xl mx-auto px-5 py-14 md:py-20 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[var(--orange-primary)]/15 border border-[var(--orange-primary)]/30 text-[var(--orange-primary)]">
              <BadgePercent size={14} /> Promoções da semana
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-5">
              Sua obra mais barata{' '}
              <span className="text-[var(--orange-primary)]">a partir de hoje</span>
            </h1>
            <p className="text-lg text-white/80 mt-4 leading-relaxed max-w-xl">
              Selecionamos os 50 produtos mais buscados da semana com até 35% de desconto. Some
              5% extra pagando com PIX.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=promocoes"
                className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-7 py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-[var(--orange-primary)]/30 transition-all hover:-translate-y-0.5"
              >
                Ver todas as ofertas
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=promocoes-pix#pix"
                className="border-2 border-white/25 hover:border-white/50 text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Quero pagar no PIX (5% off)
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <Truck size={16} className="text-[var(--orange-primary)]" /> Entrega em até 48h
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-[var(--orange-primary)]" /> Pagamento
                seguro
              </span>
            </div>
          </div>

          {/* Countdown card */}
          <div className="relative">
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
                <Clock size={14} /> Promoção termina em
              </div>
              <CountdownClient />
              <p className="text-xs text-white/60 mt-4">
                Depois desse prazo os preços voltam ao normal. Aproveite agora.
              </p>
              <Link
                href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=promocoes-countdown"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-5 py-3 rounded-md font-bold text-sm transition-colors"
              >
                Garantir desconto
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promo cards */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 py-14">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Selecionados pela equipe
            </p>
            <h2 className="text-3xl font-extrabold mt-2 text-balance">
              4 ofertas que saem rápido essa semana
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Estoque limitado. Quando acaba, acaba. O cupom já está aplicado no carrinho.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROMOS.map((p) => (
              <article
                key={p.title}
                className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
              >
                <div
                  className={`${p.accent} text-white px-4 py-6 flex items-center justify-center text-2xl font-extrabold tracking-tight`}
                >
                  {p.badge}
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <Tag size={16} className="text-[var(--orange-primary)]" />
                  <h3 className="text-base font-semibold leading-snug">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{p.note}</p>
                  <Link
                    href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=promocoes-card"
                    className="mt-2 inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold py-2.5 rounded-md text-sm transition-colors"
                  >
                    Ver na loja
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Conditions */}
        <section className="bg-secondary py-12">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <h2 className="text-2xl font-extrabold">Como funciona o desconto</h2>
            <ul className="mt-6 space-y-3 text-left max-w-2xl mx-auto text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--orange-primary)] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Adicione os produtos com selo de promoção ao carrinho. O desconto já aparece no
                preço.
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--orange-primary)] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Escolha PIX como forma de pagamento e ganhe 5% extra no valor total.
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--orange-primary)] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Receba sua obra em até 48h. Frete reduzido aplicado automaticamente para regiões
                atendidas.
              </li>
            </ul>
            <Link
              href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=promocoes-final"
              className="mt-8 inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-6 py-3 rounded-md font-bold text-sm transition-colors"
            >
              Comprar agora
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
