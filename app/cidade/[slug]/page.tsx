'use client'

import { FormEvent, use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock,
  HeadphonesIcon,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
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
import { useActiveCityStore } from '@/lib/active-city-store'

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

  const { products, loadFromSupabase } = useProductsStore()
  const { addItem } = useCartStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const [mounted, setMounted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  useEffect(() => {
    setMounted(true)
    loadFromSupabase()
  }, [loadFromSupabase])

  const city = useCitiesStore((state) => state.cities.find((c) => c.slug === slug))
  const getContact = useCitiesStore((state) => state.getContactForCity)
  const setActiveCity = useActiveCityStore((state) => state.setActiveCity)

  useEffect(() => {
    if (mounted && city) {
      setActiveCity(city.slug, city.cityName, city.state)
    }
  }, [mounted, city, setActiveCity])

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

  const activeProducts = useMemo(() => {
    if (!mounted) return []
    return products.filter((p) => p.active)
  }, [mounted, products])

  const categories = useMemo(() => {
    if (!mounted) return [] as string[]
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.active && p.category) set.add(p.category)
    })
    return Array.from(set).slice(0, 6)
  }, [mounted, products])

  const productsByCategory = useMemo(() => {
    const groups = new Map<string, typeof activeProducts>()
    activeProducts.forEach((product) => {
      const cat = product.category || 'Outros'
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat)!.push(product)
    })
    return Array.from(groups.entries()).map(([category, items]) => ({ category, items }))
  }, [activeProducts])

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

  const cityFaq = [
    {
      q: `Vocês entregam em todos os bairros de ${safeCity.cityName}?`,
      a: `Sim. Atendemos toda a regiao de ${safeCity.cityName}${safeCity.state ? ` - ${safeCity.state}` : ''} com frete reduzido e prazo medio de 48h. Para zonas rurais ou distantes consulte um atendente pelo WhatsApp.`,
    },
    {
      q: 'Qual o prazo de entrega?',
      a: 'Pedidos confirmados ate 14h saem no mesmo dia. O prazo medio para sua obra eh de 24 a 48h apos a confirmacao do pagamento.',
    },
    {
      q: 'Posso parcelar a compra?',
      a: 'Sim. Aceitamos cartao em ate 12x sem juros. Tambem temos 7% de desconto no Pix a vista.',
    },
    {
      q: 'E se eu precisar trocar algum produto?',
      a: 'Voce tem 7 dias para troca em caso de qualquer problema. O processo eh feito direto pelo WhatsApp e a retirada do produto eh sem custo.',
    },
    {
      q: 'Posso pegar nota fiscal?',
      a: 'Sim. Toda compra emite nota fiscal eletronica enviada por e-mail. Para pessoa juridica os dados sao usados na emissao.',
    },
  ]

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
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <header className="bg-white text-foreground py-3 px-5 flex items-center justify-between gap-4 flex-wrap border-b border-border shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt={headlineBrand} className="h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-[var(--orange-primary)]">
            <MapPin size={16} /> {safeCity.cityName}
            {safeCity.state ? ` - ${safeCity.state}` : ''}
          </div>
          <a
            href="/loja"
            className="text-sm font-semibold text-foreground hover:text-[var(--orange-primary)] transition-colors"
          >
            Ver loja
          </a>
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

      {categories.length > 0 && (
        <section className="py-12 px-5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
                Categorias mais procuradas em {safeCity.cityName}
              </p>
              <h2 className="text-3xl font-extrabold mt-2">O que sua obra precisa</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`/categoria/${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="bg-card border border-border rounded-xl px-4 py-5 text-center hover:border-[var(--orange-primary)] hover:shadow-md transition-all"
                >
                  <PackageCheck className="mx-auto mb-2 text-[var(--orange-primary)]" size={24} />
                  <p className="text-sm font-semibold">{cat}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="ofertas" className="py-12 px-5 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Catalogo completo em {safeCity.cityName}
            </p>
            <h2 className="text-3xl font-extrabold mt-2">
              Todos os produtos disponiveis
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Catalogo com entrega em {safeCity.cityName} e regiao. Pague no Pix com 7% off ou em
              12x sem juros.
            </p>
          </div>

          {activeProducts.length === 0 ? (
            <div className="mt-8 text-center text-sm text-muted-foreground py-10 bg-card rounded-lg">
              Cadastre produtos ativos no admin para que aparecam aqui automaticamente.
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {productsByCategory.map(({ category, items }) => (
                <div key={category}>
                  <div className="flex items-end justify-between mb-5 pb-3 border-b-2 border-[var(--orange-primary)]/30">
                    <div>
                      <h3 className="text-2xl font-extrabold">{category}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {items.map((product) => (
                      <div
                        key={product.id}
                        className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image || '/placeholder.svg'}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Sem imagem
                            </div>
                          )}
                          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wide bg-[var(--orange-primary)] text-white px-2 py-0.5 rounded">
                            Oferta
                          </span>
                        </div>
                        <div className="p-3 md:p-4 flex-1 flex flex-col gap-2 md:gap-3">
                          <h4 className="text-sm md:text-base font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h4>
                          <div>
                            <p className="text-[11px] text-muted-foreground line-through">
                              De {currency(product.price * 1.22)}
                            </p>
                            <p className="text-lg md:text-xl font-extrabold text-[var(--orange-dark)]">
                              {currency(product.price)}
                            </p>
                            <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">
                              12x de {currency(product.price / 12)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddAndCheckout(product.id)}
                            className="mt-auto inline-flex items-center justify-center gap-1.5 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold py-2 rounded-md text-xs md:text-sm transition-colors"
                          >
                            <ShoppingCart size={14} />
                            Comprar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeProducts.length > 0 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/loja"
                className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-[var(--graphite-soft)] px-6 py-3 rounded-full font-bold text-sm transition-colors"
              >
                Ver loja completa
                <ArrowRight size={16} />
              </a>
              <button
                onClick={handleWhatsApp}
                disabled={!contact}
                className="inline-flex items-center gap-2 bg-[var(--success)] hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold text-sm transition-colors"
              >
                <MessageCircle size={16} />
                Falar com {safeCity.cityName} no WhatsApp
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8">
            Por que {headlineBrand} em {safeCity.cityName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
                <Truck />
              </div>
              <h3 className="font-bold">Entrega local em {safeCity.cityName}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Logistica dedicada para {safeCity.cityName} e regiao com prazo medio de 48h.
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
                <PackageCheck />
              </div>
              <h3 className="font-bold">Garantia total</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Trocas em ate 7 dias se houver qualquer problema com o material.
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-xl text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] flex items-center justify-center mb-3">
                <ShieldCheck />
              </div>
              <h3 className="font-bold">Pagamento seguro</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cartao, Pix ou boleto. 12x sem juros e Pix com 7% de desconto.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8">
            Quem ja comprou em {safeCity.cityName} aprova
          </h2>
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
                  <p className="text-muted-foreground">
                    {t.role} - {safeCity.cityName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Tire suas duvidas
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
              Perguntas frequentes em {safeCity.cityName}
            </h2>
          </div>
          <div className="space-y-3">
            {cityFaq.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left bg-card border border-border rounded-xl px-5 py-4 hover:border-[var(--orange-primary)] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-sm md:text-base">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-[var(--orange-primary)] transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--graphite)] text-white py-12 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--orange-primary)] font-bold">
              Atendimento
            </p>
            <h3 className="text-2xl font-extrabold mt-2">Suporte direto em {safeCity.cityName}</h3>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">
              Time local que conhece a regiao, os bairros e o que sua obra precisa. Sem
              call center, sem demora.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <HeadphonesIcon className="text-[var(--orange-primary)]" size={20} />
              <p className="text-xs text-white/70 mt-2">Atendimento</p>
              <p className="font-semibold text-sm">Seg a Sab, 8h-18h</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <MapPin className="text-[var(--orange-primary)]" size={20} />
              <p className="text-xs text-white/70 mt-2">Regiao</p>
              <p className="font-semibold text-sm">
                {safeCity.cityName}
                {safeCity.state ? ` - ${safeCity.state}` : ''}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <Phone className="text-[var(--orange-primary)]" size={20} />
              <p className="text-xs text-white/70 mt-2">Contato</p>
              <p className="font-semibold text-sm">WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--orange-primary)] text-white py-12 px-5 text-center">
        <h2 className="text-3xl font-extrabold">Pronto pra comecar em {safeCity.cityName}?</h2>
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
            href="/loja"
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

      {/* Sticky CTA mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-3 flex items-center gap-2 shadow-lg">
        <a
          href="#ofertas"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-bold py-3 rounded-md text-sm"
        >
          <ShoppingCart size={16} />
          Ver ofertas
        </a>
        <button
          onClick={handleWhatsApp}
          disabled={!contact}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--success)] hover:bg-green-600 disabled:opacity-60 text-white font-bold py-3 rounded-md text-sm"
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>
      </div>
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
