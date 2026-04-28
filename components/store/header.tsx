'use client'

import Link from 'next/link'
import { MapPin, Search, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { DEFAULT_APPEARANCE, useAppearanceStore } from '@/lib/appearance-store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useCitiesStore } from '@/lib/cities-store'
import { useActiveCityStore } from '@/lib/active-city-store'
import { useTrackingParamsStore } from '@/lib/tracking-params-store'
import { openWhatsApp } from '@/lib/whatsapp-link'

export function NotificationBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const enabled = useAppearanceStore((state) => state.notificationBarEnabled)
  const text = useAppearanceStore((state) => state.notificationBarText)
  const footerWhatsapp = useAppearanceStore((state) => state.footerWhatsapp)
  const {
    contacts,
    defaultMessage,
    getContactForCurrentClickBlock,
    registerClickAndGetContact,
  } = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
      getContactForCurrentClickBlock: state.getContactForCurrentClickBlock,
      registerClickAndGetContact: state.registerClickAndGetContact,
    })),
  )
  const getContactForCity = useCitiesStore((state) => state.getContactForCity)
  const getCityBySlug = useCitiesStore((state) => state.getCityBySlug)
  const activeCitySlug = useActiveCityStore((state) => state.slug)
  const trackingParams = useTrackingParamsStore((state) => state.params)

  useEffect(() => {
    setMounted(true)
  }, [])

  const visible = mounted ? enabled : DEFAULT_APPEARANCE.notificationBarEnabled
  const message = mounted ? text : DEFAULT_APPEARANCE.notificationBarText

  if (!visible) return null

  // Resolver numero seguindo a mesma prioridade do botao flutuante
  let number: string | null = null
  let cityMessage: string | null = null
  let useClickRotation = false

  if (mounted) {
    const cityMatch = pathname?.match(/^\/cidade\/([^/]+)/)
    const citySlug = cityMatch ? cityMatch[1] : activeCitySlug
    const city = citySlug ? getCityBySlug(citySlug) : null

    if (city && city.active) {
      const cityContact = getContactForCity(citySlug!)
      if (cityContact) {
        number = cityContact.number.replace(/\D/g, '')
        cityMessage = city.defaultMessage || null
      }
    }

    if (!number) {
      const blockContact = getContactForCurrentClickBlock()
      if (blockContact) {
        number = blockContact.number.replace(/\D/g, '')
        useClickRotation = true
      } else {
        const fallback = (footerWhatsapp || '').replace(/\D/g, '')
        if (fallback.length >= 10) {
          number = fallback
        }
      }
    }
  }

  // contacts referenciado para reatividade
  void contacts

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (!number) return
    let targetNumber = number
    if (useClickRotation) {
      const next = registerClickAndGetContact()
      if (next) {
        targetNumber = next.number.replace(/\D/g, '')
      }
    }
    let finalMessage = cityMessage || defaultMessage || ''
    const trackingEntries = Object.entries(trackingParams).filter(([, v]) => v && v.length > 0)
    if (trackingEntries.length > 0) {
      const trackingTag = trackingEntries.map(([k, v]) => `${k}=${v}`).join(' | ')
      finalMessage = `${finalMessage}\n\n[origem: ${trackingTag}]`.trim()
    }
    openWhatsApp(targetNumber, finalMessage)
  }

  // Lista de promocoes que rodam na marquee. O texto admin (notificationBarText)
  // entra como primeiro item — operadores podem separar varias frases por " | ".
  const promoItems = (() => {
    const fromAdmin = (message || '')
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
    const defaults = [
      '5% OFF pagando com PIX',
      'Frete grátis para toda região',
      'Atendimento todos os dias das 08h às 22h',
      'Orçamento rápido pelo WhatsApp',
      'Materiais de obra com entrega rápida',
    ]
    const merged = [...fromAdmin, ...defaults]
    // remove duplicados mantendo ordem
    return Array.from(new Set(merged)).slice(0, 8)
  })()

  // Duplica os itens para criar loop infinito sem corte visual
  const marqueeItems = [...promoItems, ...promoItems]

  const wrapperClass =
    'block bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-dark)] text-white py-2 sm:py-2.5 overflow-hidden cursor-pointer select-none'

  const inner = (
    <div className="marquee-track text-xs sm:text-sm font-medium">
      {marqueeItems.map((item, idx) => (
        <span key={`${item}-${idx}`} className="inline-flex items-center px-6">
          <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  )

  if (number) {
    return (
      <a
        href={`https://wa.me/${number}`}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a AlfaConstrução no WhatsApp"
        className={wrapperClass}
      >
        {inner}
      </a>
    )
  }

  return <div className={wrapperClass}>{inner}</div>
}

export function HeaderTop() {
  return (
    <div className="bg-[var(--graphite)] text-white/90 px-3 sm:px-5 py-2 flex justify-between items-center text-[11px] sm:text-xs">
      <div className="flex gap-5 min-w-0">
        <span className="text-white/60 truncate">
          <span className="hidden sm:inline">Bem-vindo à </span>
          AlfaConstrução
        </span>
      </div>
      <div className="flex gap-3 sm:gap-5 shrink-0">
        <Link href="/login" className="text-white/90 hover:text-[var(--orange-primary)] transition-colors">
          Entre
        </Link>
        <span className="text-white/20">|</span>
        <Link href="/cadastro" className="text-white/90 hover:text-[var(--orange-primary)] transition-colors">
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}

export function MainHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0))
  const { address, openDialog } = useAddressStore()
  const brandName = useAppearanceStore((state) => state.brandName)
  const brandHighlight = useAppearanceStore((state) => state.brandHighlight)
  const brandSuffix = useAppearanceStore((state) => state.brandSuffix)
  const logoUrl = useAppearanceStore((state) => state.logoUrl)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/loja?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const showLogo = mounted && logoUrl
  const displayBrand = mounted ? brandName : DEFAULT_APPEARANCE.brandName
  const displayHighlight = mounted ? brandHighlight : DEFAULT_APPEARANCE.brandHighlight
  const displaySuffix = mounted ? brandSuffix : DEFAULT_APPEARANCE.brandSuffix

  return (
    <header className="bg-background px-3 sm:px-5 py-3 border-b border-border flex items-center gap-3 sm:gap-5 flex-wrap shadow-sm">
      <Link
        href="/"
        className="text-xl sm:text-2xl font-bold text-foreground min-w-fit inline-flex items-center gap-2 shrink-0"
      >
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl || "/placeholder.svg"}
            alt={displayBrand + displayHighlight}
            className="h-10 sm:h-14 w-auto object-contain"
          />
        ) : (
          <span className="truncate max-w-[180px] sm:max-w-none">
            {displayBrand}
            <span className="text-[var(--orange-primary)]">{displayHighlight}</span>
            <span className="hidden sm:inline">{displaySuffix}</span>
          </span>
        )}
      </Link>

      <div className="flex-1 max-w-md flex items-center border-2 border-border hover:border-[var(--orange-primary)]/50 focus-within:border-[var(--orange-primary)] rounded-lg overflow-hidden order-3 md:order-none w-full md:w-auto transition-colors">
        <input
          type="text"
          placeholder="O que sua obra precisa hoje?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none bg-background text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSearch}
          aria-label="Buscar"
          className="bg-[var(--orange-primary)] text-white px-4 py-2.5 hover:bg-[var(--orange-dark)] transition-colors shrink-0"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <button
          type="button"
          onClick={() => openDialog()}
          className="hidden md:inline-flex items-center gap-2 text-sm text-foreground px-3 py-2 border border-border rounded-lg hover:border-[var(--orange-primary)]/60 hover:bg-[var(--orange-soft)] transition-colors"
          title="Alterar area de entrega"
        >
          <MapPin size={16} className="text-[var(--orange-primary)]" />
          <span className="text-xs text-muted-foreground">Entregar em</span>
          <span className="font-semibold">
            {mounted ? (address?.city ?? 'Selecionar') : 'Selecionar'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => openDialog()}
          aria-label="Alterar area de entrega"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground hover:border-[var(--orange-primary)]/60 hover:bg-[var(--orange-soft)] transition-colors"
        >
          <MapPin size={18} className="text-[var(--orange-primary)]" />
        </button>

        <Link
          href="/carrinho"
          className="flex items-center gap-2 text-sm font-medium text-foreground px-2 sm:px-3 py-2 hover:bg-[var(--orange-soft)] rounded-lg transition-colors"
        >
          <ShoppingCart size={20} />
          <span className="hidden md:inline">Meu Carrinho</span>
          <span className="font-bold min-w-[20px] text-center inline-flex items-center justify-center bg-[var(--orange-primary)] text-white rounded-full px-1.5 text-xs h-5">
            {mounted ? cartCount : 0}
          </span>
        </Link>
      </div>
    </header>
  )
}

export function StoreHeader() {
  return (
    <>
      <NotificationBar />
      <MainHeader />
    </>
  )
}
