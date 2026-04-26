import type { Metadata } from 'next'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { ScratchClient } from './scratch-client'

export const metadata: Metadata = {
  title: 'Raspe e ganhe · AlfaConstrução',
  description: 'Raspe o cartão e descubra seu desconto exclusivo na sua próxima compra de materiais.',
}

export default function GamificadoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <section className="relative overflow-hidden bg-[var(--graphite)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-[420px] w-[420px] rounded-full bg-[var(--orange-primary)]/30 blur-3xl"
        />
        <div className="relative max-w-3xl mx-auto px-5 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[var(--orange-primary)]/15 border border-[var(--orange-primary)]/30 text-[var(--orange-primary)]">
            Edição limitada · 1 raspagem por visita
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-5 text-balance">
            Raspe o cartão e descubra seu{' '}
            <span className="text-[var(--orange-primary)]">desconto exclusivo</span>
          </h1>
          <p className="text-lg text-white/80 mt-4 leading-relaxed">
            Toque ou clique no cartão abaixo. Seu desconto fica liberado por 30 minutos para usar
            na sua compra com PIX.
          </p>
        </div>
      </section>

      <main className="flex-1 -mt-10 pb-14">
        <div className="max-w-md mx-auto px-5">
          <ScratchClient />
        </div>

        <section className="max-w-3xl mx-auto px-5 mt-12 text-center">
          <h2 className="text-2xl font-extrabold">Como funciona</h2>
          <ol className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            <Step n="1" text="Raspe o cartão acima e descubra seu desconto exclusivo." />
            <Step n="2" text="Vá para a loja e finalize a compra escolhendo PIX." />
            <Step n="3" text="O cupom é aplicado automaticamente no checkout." />
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="bg-card border border-border rounded-xl p-5 flex gap-4">
      <span className="shrink-0 w-9 h-9 rounded-full bg-[var(--orange-primary)] text-white text-base font-extrabold flex items-center justify-center">
        {n}
      </span>
      <p className="text-sm leading-relaxed">{text}</p>
    </li>
  )
}
