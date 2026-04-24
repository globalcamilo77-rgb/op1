import Link from 'next/link'
import { ArrowRight, Building2, HeartHandshake, ShieldCheck, Truck } from 'lucide-react'
import { InfoHero } from '@/components/store/info-hero'

export const metadata = {
  title: 'Quem Somos | AlfaConstrução',
  description:
    'Conheca a AlfaConstrução, o mercado da construcao que conecta voce aos melhores lojistas da regiao com entrega rapida e preco justo.',
}

const pilares = [
  {
    icon: ShieldCheck,
    title: 'Qualidade garantida',
    text: 'Trabalhamos somente com lojistas parceiros auditados e com avaliacao continua pelos consumidores.',
  },
  {
    icon: Truck,
    title: 'Entrega rapida',
    text: 'Logistica otimizada para entregar seu material no canteiro no prazo combinado, sem atrasos.',
  },
  {
    icon: HeartHandshake,
    title: 'Atendimento humano',
    text: 'Uma equipe comercial dedicada por WhatsApp para te ajudar em orcamentos, pedidos e pos-venda.',
  },
  {
    icon: Building2,
    title: 'Foco em obras',
    text: 'De reformas rapidas a obras completas: selecionamos produtos que atendem o jeito de quem constroi.',
  },
]

export default function QuemSomosPage() {
  return (
    <>
      <InfoHero
        eyebrow="Sobre a AlfaConstrução"
        title="Somos o mercado da construcao feito para a sua obra"
        description="Nascemos para simplificar a compra de materiais de construcao: reunindo lojistas de confianca em uma plataforma unica com preco competitivo, entrega rapida e atendimento proximo."
        breadcrumbLabel="Quem Somos"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-6 text-[15px] leading-relaxed text-foreground">
          <p>
            A <strong>AlfaConstrução</strong> é uma plataforma online que reúne os melhores lojistas de materiais de construção
            em uma experiência simples, rápida e transparente. Em vez de você rodar por várias lojas fazendo orçamento, nós
            consolidamos os pedidos e garantimos o melhor preço em cada categoria — do cimento ao acabamento.
          </p>
          <p>
            Atuamos como um marketplace: cada compra é feita através de lojistas parceiros pré-aprovados, que operam com
            nota fiscal, estoque real e equipe própria de entrega. Isso significa <strong>segurança na compra</strong> e
            <strong> rastreabilidade total</strong> do seu pedido, do orçamento até a descarga no canteiro.
          </p>
          <p>
            Nossa missão é clara: <strong>fazer sua obra andar mais rápido, com menos dor de cabeça e custo justo</strong>.
            Por isso investimos em atendimento consultivo via WhatsApp, logística regional e ferramentas para você acompanhar
            tudo em tempo real.
          </p>
        </div>
      </section>

      <section className="bg-secondary px-5 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wider text-[var(--orange-primary)] font-semibold">
              Por que a AlfaConstrução
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
              Quatro pilares que guiam o nosso trabalho
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pilares.map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border rounded-lg p-5 hover:border-[var(--orange-primary)]/40 hover:shadow-md transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[var(--orange-primary)] text-[var(--orange-primary)] mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Vamos construir juntos?
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Solicite um orçamento agora pelo WhatsApp, fale com um consultor ou conheça como a plataforma funciona.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-[var(--orange-primary)] transition-colors"
            >
              Como funciona
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--orange-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--orange-dark)] transition-colors"
            >
              Tirar duvidas
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
