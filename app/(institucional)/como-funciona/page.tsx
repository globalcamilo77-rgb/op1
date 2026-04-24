import Link from 'next/link'
import { ArrowRight, ClipboardList, MessageSquare, PackageCheck, Search, Truck, Wallet } from 'lucide-react'
import { InfoHero } from '@/components/store/info-hero'

export const metadata = {
  title: 'Como Funciona | AlfaConstrução',
  description:
    'Entenda o passo a passo para comprar materiais de construcao na AlfaConstrução: do orcamento a entrega no canteiro.',
}

const passos = [
  {
    icon: Search,
    title: '1. Escolha seus materiais',
    text: 'Navegue pelas categorias ou receba uma lista personalizada com base na sua obra. Voce ve preco, disponibilidade e prazo antes de decidir.',
  },
  {
    icon: ClipboardList,
    title: '2. Monte seu pedido',
    text: 'Adicione produtos ao carrinho com a quantidade exata que voce precisa. De sacas de cimento a metragem de fio, voce ajusta tudo num lugar so.',
  },
  {
    icon: MessageSquare,
    title: '3. Fale com um consultor',
    text: 'Se preferir, clique no WhatsApp. Um especialista confere o pedido, sugere substitutos e passa a melhor condicao para fechar.',
  },
  {
    icon: Wallet,
    title: '4. Pague do seu jeito',
    text: 'Aceitamos PIX, cartao e boleto. O pagamento so e processado depois da confirmacao e voce recebe nota fiscal do lojista responsavel.',
  },
  {
    icon: Truck,
    title: '5. Receba no canteiro',
    text: 'A logistica regional garante entrega rapida e rastreavel no endereco da obra, respeitando janelas combinadas.',
  },
  {
    icon: PackageCheck,
    title: '6. Pos-venda garantido',
    text: 'Se algo nao chegar como combinado, abra um chamado. Nosso time cuida da troca ou devolucao com o lojista por voce.',
  },
]

export default function ComoFuncionaPage() {
  return (
    <>
      <InfoHero
        eyebrow="Passo a passo"
        title="Como funciona a AlfaConstrução"
        description="Um fluxo simples, feito para quem esta tocando obra. Do primeiro orcamento a descarga do material, voce tem acompanhamento em cada etapa."
        breadcrumbLabel="Como Funciona"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {passos.map((passo) => (
              <div
                key={passo.title}
                className="bg-background border border-border rounded-lg p-6 hover:border-[var(--orange-primary)]/40 hover:shadow-md transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--orange-soft)] text-[var(--orange-primary)] mb-4">
                  <passo.icon size={22} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{passo.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{passo.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Tira-duvidas rapido
          </h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-foreground">
            <p>
              <strong>Preciso me cadastrar?</strong> Nao e obrigatorio. Voce pode orçar e comprar apenas informando CEP,
              nome e contato. O cadastro serve para acompanhar pedidos anteriores e agilizar compras recorrentes.
            </p>
            <p>
              <strong>Quem emite a nota fiscal?</strong> Cada compra e faturada pelo lojista parceiro responsavel pelo
              produto. A AlfaConstrução e a plataforma que conecta voce aos lojistas com seguranca.
            </p>
            <p>
              <strong>Consigo comprar para pessoa juridica (CNPJ)?</strong> Sim. Basta informar o CNPJ na etapa de
              checkout ou solicitar ao consultor pelo WhatsApp. Emitimos nota conforme sua operacao.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-[var(--orange-primary)] transition-colors"
            >
              Ver FAQ completo
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--orange-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--orange-dark)] transition-colors"
            >
              Comecar orcamento
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
