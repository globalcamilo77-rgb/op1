import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Truck,
  Calculator,
  HandCoins,
  PackageCheck,
  Phone,
} from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'

export const metadata: Metadata = {
  title: 'Vendas diretas (B2B) · AlfaConstrução',
  description:
    'Compras em volume para construtoras, construtores autônomos e revendas. Preço de fábrica, prazo estendido e frete dedicado.',
}

export default function VendasDiretasPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--graphite)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-10 h-[420px] w-[420px] rounded-full bg-[var(--orange-primary)]/20 blur-3xl"
        />
        <div className="relative max-w-6xl mx-auto px-5 py-14 md:py-20 grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[var(--orange-primary)]/15 border border-[var(--orange-primary)]/30 text-[var(--orange-primary)]">
              <Building2 size={14} /> Vendas diretas (B2B)
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-5 text-balance">
              Compra em volume com{' '}
              <span className="text-[var(--orange-primary)]">preço de fábrica</span>
            </h1>
            <p className="text-lg text-white/80 mt-4 leading-relaxed max-w-xl">
              Construtoras, autônomos e revendas: fechamos contrato direto, condição de pagamento
              estendida e frete dedicado para a sua obra ou estoque.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=vendas-diretas"
                className="inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-7 py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-[var(--orange-primary)]/30 transition-all hover:-translate-y-0.5"
              >
                Pedir cotação na loja
                <ArrowRight size={16} />
              </Link>
              <a
                href="#especialista"
                className="border-2 border-white/25 hover:border-white/50 text-white px-7 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Falar com especialista
              </a>
            </div>
          </div>

          {/* Spec card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 grid grid-cols-2 gap-5">
            <Stat value="-22%" label="Economia média" />
            <Stat value="30/45 dias" label="Prazo de pagamento" />
            <Stat value="48h" label="Entrega expressa" />
            <Stat value="127+" label="Construtoras parceiras" />
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Beneficios */}
        <section className="max-w-6xl mx-auto px-5 py-14">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Como atendemos
            </p>
            <h2 className="text-3xl font-extrabold mt-2 text-balance">
              Soluções pensadas pra quem compra em volume
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Benefit
              icon={Calculator}
              title="Tabela de preços por volume"
              text="Quanto mais você compra, menor o preço unitário. Tabelas progressivas para 1, 5 e 20 paletes."
            />
            <Benefit
              icon={HandCoins}
              title="Prazo de pagamento estendido"
              text="Boleto em 30/45 dias para clientes recorrentes ou PIX com 5% off à vista."
            />
            <Benefit
              icon={Truck}
              title="Frete dedicado e exclusivo"
              text="Caminhão direto da fábrica até a sua obra ou depósito, sem trânsito por revendas."
            />
            <Benefit
              icon={PackageCheck}
              title="Faturamento separado"
              text="Notas fiscais por obra, com CNPJ ou CPF. Aceitamos múltiplos centros de custo."
            />
            <Benefit
              icon={Phone}
              title="Gerente de conta dedicado"
              text="Atendimento humano via WhatsApp para reposição automática e ajustes."
            />
            <Benefit
              icon={Building2}
              title="Linhas industriais"
              text="Cimento ensacado, granel, ferro, blocos estruturais e argamassas industriais."
            />
          </div>
        </section>

        {/* Especialista CTA */}
        <section id="especialista" className="bg-secondary py-14">
          <div className="max-w-4xl mx-auto px-5 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-balance">
                Cotação em até 30 minutos com um especialista
              </h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Você nos manda a lista de materiais e a região. A gente devolve um orçamento com
                preço, prazo de entrega e condição de pagamento, sem compromisso.
              </p>
              <Link
                href="/loja?utm_source=site&utm_medium=funnel&utm_campaign=vendas-diretas-cotacao#cotacao"
                className="mt-6 inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-6 py-3 rounded-md font-bold text-sm transition-colors"
              >
                Pedir cotação
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
                Você manda
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>• Lista de materiais (ou foto da planilha)</li>
                <li>• Cidade / CEP da obra</li>
                <li>• Prazo desejado</li>
                <li>• CNPJ ou CPF para faturamento</li>
              </ul>
              <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold mt-4">
                A gente devolve
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>• Preço por item + total</li>
                <li>• Prazo e taxa de frete</li>
                <li>• Condição de pagamento</li>
                <li>• Vencimento da proposta</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--orange-primary)]">
        {value}
      </div>
      <div className="text-xs md:text-sm text-white/70 mt-1">{label}</div>
    </div>
  )
}

function Benefit({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Building2
  title: string
  text: string
}) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="w-10 h-10 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
        <Icon size={18} />
      </div>
      <h3 className="font-bold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{text}</p>
    </div>
  )
}
