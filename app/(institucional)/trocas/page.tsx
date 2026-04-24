import Link from 'next/link'
import { ArrowRight, CalendarClock, PackageOpen, RefreshCcw, ShieldCheck } from 'lucide-react'
import { InfoHero } from '@/components/store/info-hero'

export const metadata = {
  title: 'Trocas e Devolucoes | AlfaConstrução',
  description: 'Politica de trocas e devolucoes da AlfaConstrução. Como proceder em caso de produto com defeito ou arrependimento.',
}

const passos = [
  {
    icon: CalendarClock,
    title: '1. Prazo de 7 dias (arrependimento)',
    text: 'Em conformidade com o CDC, voce tem ate 7 dias corridos, contados a partir do recebimento, para desistir da compra sem precisar justificar.',
  },
  {
    icon: PackageOpen,
    title: '2. Embalagem e estado',
    text: 'O produto deve ser devolvido em sua embalagem original, sem sinais de uso, acompanhado de nota fiscal e acessorios.',
  },
  {
    icon: RefreshCcw,
    title: '3. Troca por defeito',
    text: 'Para produtos com defeito de fabricacao dentro do prazo de garantia, acionamos o lojista parceiro para substituir o item ou efetuar o reparo.',
  },
  {
    icon: ShieldCheck,
    title: '4. Reembolso',
    text: 'Apos analise do produto devolvido, o reembolso e processado na mesma forma de pagamento em ate 7 dias uteis.',
  },
]

export default function TrocasPage() {
  return (
    <>
      <InfoHero
        eyebrow="Politica"
        title="Trocas e Devolucoes"
        description="Entenda como funciona a politica de troca e devolucao na AlfaConstrução — direitos, prazos e como abrir um chamado."
        breadcrumbLabel="Trocas e Devolucoes"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {passos.map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border rounded-lg p-6 hover:border-[var(--orange-primary)]/40 transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--orange-soft)] text-[var(--orange-primary)] mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-secondary rounded-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Como abrir um chamado
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground leading-relaxed">
              <li>Entre em contato pelo WhatsApp ou e-mail informados no rodape.</li>
              <li>Informe o numero do pedido, motivo da solicitacao e fotos do produto (se aplicavel).</li>
              <li>
                Aguarde a nossa analise — respondemos em ate 2 dias uteis. Se aprovado, coordenamos a retirada
                com o lojista responsavel.
              </li>
              <li>Ao recebermos o produto e validar o estado, processamos a troca ou o reembolso.</li>
            </ol>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-[var(--orange-primary)] transition-colors"
              >
                Ver FAQ
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/privacidade"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-[var(--orange-primary)] transition-colors"
              >
                Politica de Privacidade
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-xs text-muted-foreground leading-relaxed">
            Alguns produtos podem ter restricoes especificas para devolucao (ex.: itens lacrados, cortados sob medida
            ou com uso iniciado). Nesses casos, o time ira te orientar no chamado.
          </p>
        </div>
      </section>
    </>
  )
}
