'use client'

import Link from 'next/link'
import { MapPin, Search, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { useAddressStore } from '@/lib/address-store'
import { DEFAULT_APPEARANCE, useAppearanceStore } from '@/lib/appearance-store'

export function NotificationBar() {
  const [mounted, setMounted] = useState(false)
  const enabled = useAppearanceStore((state) => state.notificationBarEnabled)
  const text = useAppearanceStore((state) => state.notificationBarText)

  useEffect(() => {
    setMounted(true)
  }, [])

  const visible = mounted ? enabled : DEFAULT_APPEARANCE.notificationBarEnabled
  const message = mounted ? text : DEFAULT_APPEARANCE.notificationBarText

  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-[var(--orange-primary)] to-[var(--orange-dark)] text-white px-5 py-2.5 text-sm flex justify-between items-center flex-wrap gap-5">
      <span className="leading-snug font-medium">
        {message}{' '}
        <Link href="#" className="underline underline-offset-2 hover:text-white/90">
          Clique aqui
        </Link>
      </span>
    </div>
  )
}

export function HeaderTop() {
  return (
    <div className="bg-[var(--graphite)] text-white/90 px-5 py-2 flex justify-between items-center text-xs">
      <div className="flex gap-5">
        <span className="text-white/60">Bem-vindo à AlfaConstrução</span>
      </div>
      <div className="flex gap-5">
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
      console.log('Searching for:', searchQuery)
    }
  }

  const showLogo = mounted && logoUrl
  const displayBrand = mounted ? brandName : DEFAULT_APPEARANCE.brandName
  const displayHighlight = mounted ? brandHighlight : DEFAULT_APPEARANCE.brandHighlight
  const displaySuffix = mounted ? brandSuffix : DEFAULT_APPEARANCE.brandSuffix

  return (
    <header className="bg-background px-5 py-3 border-b border-border flex items-center gap-5 flex-wrap shadow-sm">
      <Link href="/" className="text-2xl font-bold text-foreground min-w-fit inline-flex items-center gap-2">
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={displayBrand + displayHighlight}
            className="h-14 w-auto object-contain"
          />
        ) : (
          <span>
            {displayBrand}
            <span className="text-[var(--orange-primary)]">{displayHighlight}</span>
            {displaySuffix}
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
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-background text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSearch}
          className="bg-[var(--orange-primary)] text-white px-4 py-2.5 hover:bg-[var(--orange-dark)] transition-colors"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          onClick={() => openDialog()}
          className="hidden md:inline-flex items-center gap-2 text-sm text-foreground px-3 py-2 border border-border rounded-lg hover:border-[var(--orange-primary)]/60 hover:bg-[var(--orange-soft)] transition-colors"
          title="Alterar area de entrega"
        >
          <MapPin size={16} className="text-[var(--orange-primary)]" />
          <span className="text-xs text-muted-foreground">Entregar em</span>
          <span className="font-semibold">
            {mounted ? address?.city ?? 'Selecionar' : 'Selecionar'}
          </span>
        </button>

        <Link
          href="/carrinho"
          className="flex items-center gap-2 text-sm font-medium text-foreground px-3 py-2 hover:bg-[var(--orange-soft)] rounded-lg transition-colors"
        >
          <ShoppingCart size={20} />
          <span className="hidden sm:inline">Meu Carrinho</span>
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
