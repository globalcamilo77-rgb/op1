'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageCircle, Store, TrendingUp, Users } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { InfoHero } from '@/components/store/info-hero'
import { useWhatsAppStore } from '@/lib/whatsapp-store'

const beneficios = [
  {
    icon: TrendingUp,
    title: 'Mais vendas sem esforco',
    text: 'Aparece no nosso marketplace e recebe pedidos qualificados, sem precisar investir pesado em marketing.',
  },
  {
    icon: Users,
    title: 'Clientes recorrentes',
    text: 'Conectamos voce a construtores, reformadores e profissionais da obra de toda a regiao.',
  },
  {
    icon: Store,
    title: 'Estoque integrado',
    text: 'Integramos com o seu sistema para atualizar produtos, preco e disponibilidade em tempo real.',
  },
]

export default function VenderPage() {
  const whatsapp = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
    })),
  )

  const [form, setForm] = useState({
    razaoSocial: '',
    cnpj: '',
    nome: '',
    telefone: '',
    email: '',
    categorias: '',
    mensagem: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const whatsappHref = useMemo(() => {
    const active = whatsapp.contacts.find((c) => c.active && c.number.replace(/\D/g, '').length >= 10)
    if (!active) return null
    const msg = encodeURIComponent(
      'Ola! Quero ser lojista parceiro da AlfaConstrução. Podemos conversar?',
    )
    return `https://wa.me/${active.number.replace(/\D/g, '')}?text=${msg}`
  }, [whatsapp.contacts])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <>
      <InfoHero
        eyebrow="Para lojistas"
        title="Venda na AlfaConstrução e escale suas vendas"
        description="Convidamos lojas de materiais de construcao com estoque, nota fiscal e logistica para vender junto a gente. Mais demanda, menos custo comercial."
        breadcrumbLabel="Quero vender"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {beneficios.map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border rounded-lg p-6 hover:border-[var(--orange-primary)]/40 hover:shadow-md transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--orange-soft)] text-[var(--orange-primary)] mb-4">
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
            <div className="bg-background border border-border rounded-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                Cadastre sua loja
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Preencha os dados e em ate 48h um consultor vai entrar em contato para alinhar o onboarding.
              </p>

              {submitted ? (
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-green-900">Cadastro recebido!</p>
                    <p className="text-sm text-green-800 mt-1">
                      Obrigado, {form.nome || 'parceiro'}. Nosso time vai entrar em contato pelo
                      telefone {form.telefone || 'informado'} ou e-mail {form.email || 'cadastrado'}.
                    </p>
                  </div>
                </div>
              ) : (
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Razao social
                    </span>
                    <input
                      required
                      value={form.razaoSocial}
                      onChange={handleChange('razaoSocial')}
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      CNPJ
                    </span>
                    <input
                      required
                      value={form.cnpj}
                      onChange={handleChange('cnpj')}
                      placeholder="00.000.000/0000-00"
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Seu nome
                    </span>
                    <input
                      required
                      value={form.nome}
                      onChange={handleChange('nome')}
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Telefone
                    </span>
                    <input
                      required
                      value={form.telefone}
                      onChange={handleChange('telefone')}
                      placeholder="(11) 90000-0000"
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      E-mail comercial
                    </span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Categorias que voce vende
                    </span>
                    <input
                      value={form.categorias}
                      onChange={handleChange('categorias')}
                      placeholder="Cimento, argamassa, eletricos..."
                      className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Conte mais sobre a sua loja
                    </span>
                    <textarea
                      value={form.mensagem}
                      onChange={handleChange('mensagem')}
                      rows={4}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--orange-primary)]"
                    />
                  </label>

                  <div className="md:col-span-2 flex items-center justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--orange-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--orange-dark)] transition-colors"
                    >
                      Enviar cadastro
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="bg-[var(--graphite)] text-white rounded-lg p-6 md:p-8">
              <h3 className="text-lg font-bold mb-3">Prefere falar direto?</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-5">
                Fale agora com um consultor comercial pelo WhatsApp. Nosso time tira duvidas sobre comissao, integracao
                e prazos.
              </p>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--orange-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--orange-dark)] transition-colors"
                >
                  <MessageCircle size={16} />
                  Chamar no WhatsApp
                </a>
              ) : (
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--orange-primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--orange-dark)] transition-colors"
                >
                  Ver FAQ
                  <ArrowRight size={14} />
                </Link>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
