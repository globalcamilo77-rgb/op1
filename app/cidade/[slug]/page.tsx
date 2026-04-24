'use client'

import { FormEvent, use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react'
import { useProductsStore } from '@/lib/products-store'
import { useCartStore } from '@/lib/cart-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { useCitiesStore, type CityContact, type CityPage } from '@/lib/cities-store'
import { useAppearanceStore, DEFAULT_APPEARANCE } from '@/lib/appearance-store'

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const TESTIMONIALS = [
  {
    name: 'Marcelo S.',
    role: 'Engenheiro Civil',
    text: 'Comprei 2 paletes de cimento numa quarta e chegou na sexta. Atendimento direto no whatsapp ajudou demais.',
  },
  {
    name: 'Patricia R.',
    role: 'Reformando a casa',
    text: 'Consegui o melhor preco entre 4 lojas. O frete inclusive saiu mais barato do que retirar pessoalmente.',
  },
  {
    name: 'Joao P.',
    role: 'Mestre de obras',
    text: 'Uso ja faz 6 meses pra todas as obras. Sempre entrega no prazo e quando precisei trocar uma peca foi rapido.',
  },
]

function Countdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const diff = Math.max(0, deadline - now)
  const hours = String(Math.floor(diff / 3600000)).padStart(2, '0')
  const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  return (
    <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur px-4 py-2 rounded-full text-sm font-bold tracking-widest">
      <Clock size={14} />
      {hours}:{minutes}:{seconds}
    </div>
  )
}

interface Params {
  slug: string
}

export default function CityLandingPage({ params }: { params: Promise<Params> }) {
  const { slug } = use(params)
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    loadFromSupabase()
  }, [loadFromSupabase])

  const { products, loadFromSupabase } = useProductsStore()
  const { addItem } = useCartStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const city = useCitiesStore((state) => state.cities.find((c) => c.slug === slug))
  const getContact = useCitiesStore((state) => state.getContactForCity)

  const brand = useAppearanceStore(
    useShallow((state) => ({
      brandName: state.brandName,
      brandHighlight: state.brandHighlight,
    })),
  )

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [postal, setPostal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [deadline] = useState(() => Date.now() + 6 * 60 * 60 * 1000)

  const featured = useMemo(() => {
    if (!mounted) return []
    return products.filter((p) => p.active).slice(0, 3)
  }, [mounted, products])

  useEffect(() => {
    if (!mounted || !city) return
    trackEvent('page_view', {
      meta: {
        type: 'city_landing',
        city: city.slug,
        cityName: city.cityName,
      },
    })
  }, [mounted, city, trackEvent])

  if (mounted && !city) {
    return <NotFound slug={slug} onBack={() => router.push('/')} />
  }

  const safeCity: CityPage = city ?? {
    id: 'loading',
    slug,
    cityName: '',
    state: '',
    active: true,
    headline: '',
    subheadline: '',
    offerBadge: '',
    defaultMessage: '',
    rotationIntervalMinutes: 15,
    contacts: [],
    createdAt: 0,
  }

  const headlineBrand = mounted
    ? `${brand.brandName}${brand.brandHighlight}`
    : `${DEFAULT_APPEARANCE.brandName}${DEFAULT_APPEARANCE.brandHighlight}`

  const contact: CityContact | null = mounted ? getContact(slug) : null

  const handleWhatsApp = () => {
    if (!contact) return
    const message = `${safeCity.defaultMessage}${name.trim() ? `\n\nMeu nome: ${name.trim()}` : ''}${
      postal.trim() ? `\nCEP: ${postal.trim()}` : ''
    }`
    trackEvent('lead', {
      meta: {
        type: 'whatsapp_click',
        source: 'city_landing',
        city: safeCity.slug,
      },
    })
    window.open(
      `https://wa.me/${contact.number}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleAddAndCheckout = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    addItem(
      {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
      },
      1,
    )
    trackEvent('add_to_cart', {
      value: product.price,
      meta: {
        productId: product.id,
        productName: product.name,
        source: 'city_landing',
        city: safeCity.slug,
      },
    })
    router.push('/checkout')
  }

  const handleLeadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !phone.trim()) return
    trackEvent('lead', {
      meta: {
        type: 'lp_form',
        source: 'city_landing',
        city: safeCity.slug,
        hasCep: postal ? 'true' : 'false',
      },
    })
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-white text-foreground py-3 px-5 flex items-center justify-between gap-4 flex-wrap border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AlfaConstrução" className="h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--orange-primary)]">
          <MapPin size={16} /> {safeCity.cityName}
          {safeCity.state ? ` - ${safeCity.state}` : ''}
        </div>
      </header>

      <section className="bg-gradient-to-br from-[var(--graphite)] via-[var(--graphite-soft)] to-[var(--graphite)] text-white">
        <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
              <BadgeCheck size={14} /> {safeCity.offerBadge || `Oferta para ${safeCity.cityName}`}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{safeCity.headline}</h1>
            <p className="mt-4 text-lg text-white/90 leading-relaxed">{safeCity.subheadline}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#ofertas"
                className="inline-flex items-center gap-2 bg-white text-[var(--orange-dark)] hover:bg-white/90 px-5 py-3 rounded-full font-bold text-sm transition-colors"
              >
                Ver ofertas
                <ArrowRight size={16} />
              </a>
              <button
                onClick={handleWhatsApp}
                disabled={!contact}
                className="inline-flex items-center gap-2 bg-[var(--success)] hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-full font-bold text-sm transition-colors"
              >
                <MessageCircle size={16} />
                {contact ? `Falar no WhatsApp de ${safeCity.cityName}` : 'WhatsApp indisponivel'}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/90">
              <div className="inline-flex items-center gap-2">
                <Star size={14} className="fill-yellow-300 text-yellow-300" />
                <span>4.8/5 - 2.300+ obras atendidas</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck size={14} /> Pagamento 100% seguro
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Termina em</p>
              <Countdown deadline={deadline} />
            </div>
          </div>

          <div className="bg-white text-foreground rounded-2xl shadow-2xl p-6">
            {submitted ? (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <BadgeCheck className="text-green-700" />
                </div>
                <h3 className="text-lg font-bold">Recebemos seu contato!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Em breve um especialista da {headlineBrand} em {safeCity.cityName} vai te chamar
                  com a melhor proposta.
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="mt-4 inline-flex items-center gap-2 bg-[var(--success)] hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
                >
                  <MessageCircle size={14} /> Adiantar pelo WhatsApp
                </button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--orange-dark)] font-bold">
                    Orcamento rapido para {safeCity.cityName}
                  </p>
                  <h3 className="text-2xl font-extrabold mt-1">
                    Te respondemos em{' '}
                    <span className="text-[var(--orange-primary)]">10 minutos</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sem compromisso. Frete e prazo personalizados pra sua obra em{' '}
                    {safeCity.cityName}.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="px-3 py-3 border border-border rounded-md text-sm outline-none focus:border-[var(--orange-primary)] bg-background"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Telefone com DDD (WhatsApp)"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="px-3 py-3 border border-border rounded-md text-sm outline-none focus:border-[var(--orange-primary)] bg-background"
                  />
                  <input
                    placeholder="CEP da obra (opcional)"
                    value={postal}
                    onChange={(event) => setPostal(event.target.value)}
                    className="px-3 py-3 border border-border rounded-md text-sm outline-none focus:border-[var(--orange-primary)] bg-background"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold py-3 rounded-md text-sm transition-colors"
                >
                  Quero meu orcamento agora
                  <ArrowRight size={16} />
                </button>

                <p className="text-[11px] text-muted-foreground text-center">
                  Ao enviar voce concorda em receber contato pelo WhatsApp e e-mail.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-10">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-[var(--orange-primary)]">2.3k+</p>
            <p className="text-xs text-muted-foreground">Obras atendidas</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[var(--orange-primary)]">48h</p>
            <p className="text-xs text-muted-foreground">Prazo medio de entrega</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[var(--orange-primary)]">22%</p>
            <p className="text-xs text-muted-foreground">Economia media</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-[var(--orange-primary)]">4.8/5</p>
            <p className="text-xs text-muted-foreground">Nota dos clientes</p>
          </div>
        </div>
      </section>

      <section id="ofertas" className="py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Mais vendidos em {safeCity.cityName}
            </p>
            <h2 className="text-3xl font-extrabold mt-2">Ofertas que saem hoje</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Selecionamos os produtos com maior giro e melhores precos para sua obra.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.length === 0 && (
              <div className="md:col-span-3 text-center text-sm text-muted-foreground py-10 bg-secondary rounded-lg">
                Cadastre produtos ativos no admin para que aparecam aqui automaticamente.
              </div>
            )}
            {featured.map((product) => (
              <div
                key={product.id}
                className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Sem imagem
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wide bg-[var(--orange-primary)] text-white px-2 py-1 rounded">
                    Oferta
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <h3 className="text-base font-semibold leading-snug line-clamp-2">{product.name}</h3>
                  <div>
                    <p className="text-xs text-muted-foreground line-through">
                      De {currency(product.price * 1.22)}
                    </p>
                    <p className="text-2xl font-extrabold text-[var(--orange-dark)]">
                      por {currency(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou 12x de {currency(product.price / 12)} sem juros
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddAndCheckout(product.id)}
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold py-2.5 rounded-md text-sm transition-colors"
                  >
                    <ShoppingCart size={16} />
                    Comprar agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-extrabold text-center mb-8">
            Por que {headlineBrand} em {safeCity.cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
                <Truck />
              </div>
              <h3 className="font-bold">Entrega local</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Logistica dedicada para {safeCity.cityName} e regiao.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
                <PackageCheck />
              </div>
              <h3 className="font-bold">Garantia total</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Trocas em ate 7 dias se houver qualquer problema.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
                <ShieldCheck />
              </div>
              <h3 className="font-bold">Pagamento seguro</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cartao, Pix ou boleto. 12x sem juros e Pix com desconto.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-extrabold text-center mb-8">Quem ja comprou aprova</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 text-xs">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--orange-primary)] text-white py-12 px-5 text-center">
        <h2 className="text-3xl font-extrabold">
          Pronto pra comecar em {safeCity.cityName}?
        </h2>
        <p className="text-sm md:text-base mt-2 opacity-90 max-w-xl mx-auto">
          Fale com um especialista agora pelo WhatsApp ou navegue pelo catalogo completo.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleWhatsApp}
            disabled={!contact}
            className="inline-flex items-center gap-2 bg-[var(--success)] hover:bg-green-600 disabled:opacity-60 text-white px-6 py-3 rounded-full font-bold text-sm"
          >
            <MessageCircle size={16} />
            Atendimento pelo WhatsApp
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-white text-[var(--orange-dark)] hover:bg-white/90 px-6 py-3 rounded-full font-bold text-sm"
          >
            Ver loja completa
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <footer className="bg-[var(--graphite)] text-white/70 py-6 text-center text-xs">
        &copy; 2026 - {headlineBrand} em {safeCity.cityName}. Todos os direitos reservados.
      </footer>
    </div>
  )
}

function NotFound({ slug, onBack }: { slug: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
      <MapPin size={48} className="text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Cidade nao configurada</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        Nao existe uma pagina ativa para <code className="bg-secondary px-1.5 py-0.5 rounded">/cidade/{slug}</code>.
        Crie ela no SuperAdmin &gt; Cidades.
      </p>
      <button
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white px-5 py-2.5 rounded-md text-sm font-semibold"
      >
        Voltar para a loja
        <ArrowRight size={16} />
      </button>
    </div>
  )
}
