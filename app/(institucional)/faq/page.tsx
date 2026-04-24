'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { InfoHero } from '@/components/store/info-hero'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { cn } from '@/lib/utils'

const groups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Sobre a plataforma',
    items: [
      {
        q: 'A AlfaConstrução possui loja fisica?',
        a: 'Nao. Somos uma plataforma online de marketplace que reune lojistas fisicos da regiao. Ao comprar na AlfaConstrução voce compra de uma loja parceira que entrega no endereco da sua obra, com nota fiscal.',
      },
      {
        q: 'Como os lojistas sao selecionados?',
        a: 'Trabalhamos apenas com lojistas convidados que passam por analise de documentos, estoque e logistica. Apos as vendas iniciarem, monitoramos continuamente as avaliacoes dos clientes.',
      },
    ],
  },
  {
    title: 'Pedidos e pagamentos',
    items: [
      {
        q: 'Quais formas de pagamento estao disponiveis?',
        a: 'Aceitamos PIX, cartao de credito e boleto. As formas ativas no seu checkout podem variar conforme configuracao do lojista responsavel pela venda.',
      },
      {
        q: 'Como cancelar uma compra?',
        a: 'Entre em contato pelo WhatsApp da plataforma ou pelo e-mail de atendimento. Vamos coordenar o cancelamento com o lojista responsavel, conforme o status do pedido.',
      },
      {
        q: 'Posso comprar com CNPJ?',
        a: 'Sim. Basta informar o CNPJ no checkout ou falar com o consultor pelo WhatsApp para emitirmos a nota conforme sua operacao.',
      },
    ],
  },
  {
    title: 'Entrega e logistica',
    items: [
      {
        q: 'Qual o prazo de entrega?',
        a: 'Os prazos variam conforme categoria, volume e endereco da obra. Voce sempre ve o prazo estimado antes de fechar o pedido e recebe atualizacoes ate a entrega.',
      },
      {
        q: 'Voces entregam em qualquer endereco?',
        a: 'Atendemos as cidades da nossa cobertura. Se o seu CEP estiver fora da area de atuacao, o site te avisa e voce pode falar com o consultor para checar alternativas.',
      },
      {
        q: 'E se o pedido nao chegar como combinado?',
        a: 'Abra um chamado pelo WhatsApp ou e-mail e nosso time intermedia a troca/devolucao com o lojista. Confira a politica completa em /trocas.',
      },
    ],
  },
]

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>('0-0')

  const whatsapp = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
    })),
  )

  const active = whatsapp.contacts.find(
    (c) => c.active && c.number.replace(/\D/g, '').length >= 10,
  )
  const waHref = active
    ? `https://wa.me/${active.number.replace(/\D/g, '')}?text=${encodeURIComponent(
        whatsapp.defaultMessage || 'Olá, tenho uma dúvida sobre a AlfaConstrução.',
      )}`
    : null

  return (
    <>
      <InfoHero
        eyebrow="Central de ajuda"
        title="Perguntas frequentes"
        description="As duvidas mais comuns sobre como comprar, receber e pagar na AlfaConstrução."
        breadcrumbLabel="FAQ"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          {groups.map((group, gIdx) => (
            <div key={group.title}>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">{group.title}</h2>
              <div className="flex flex-col gap-3">
                {group.items.map((item, iIdx) => {
                  const key = `${gIdx}-${iIdx}`
                  const isOpen = open === key
                  return (
                    <div
                      key={key}
                      className="bg-background border border-border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setOpen(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm font-semibold text-foreground pr-4">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={cn(
                            'text-muted-foreground flex-shrink-0 transition-transform duration-200',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5">
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary px-5 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Nao encontrou sua duvida?
          </h2>
          <p className="text-muted-foreground mb-6">
            Fale com nosso time — respondemos rapido pelo WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--orange-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--orange-dark)] transition-colors"
              >
                <MessageCircle size={16} />
                Falar no WhatsApp
              </a>
            )}
            <Link
              href="/como-funciona"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-[var(--orange-primary)] transition-colors"
            >
              Como funciona
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
