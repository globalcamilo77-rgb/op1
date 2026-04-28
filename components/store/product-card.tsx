'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { Check, MessageCircle, ShoppingCart, Star } from 'lucide-react'
import { QuantityPicker } from './quantity-picker'
import type { StoreProduct } from '@/lib/products-store'
import { useCartStore } from '@/lib/cart-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface ProductCardProps {
  product: StoreProduct
  showSubcategoryBadge?: boolean
}

export const ProductCard = memo(function ProductCard({ product, showSubcategoryBadge }: ProductCardProps) {
  const { addItem } = useCartStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)
  const registerClickAndGetContact = useWhatsAppStore((s) => s.registerClickAndGetContact)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const handleWhatsAppClick = () => {
    const contact = registerClickAndGetContact()
    if (!contact) return
    
    const message = `Ola, tudo bem? Gostaria de receber mais informacoes sobre ${product.name}`
    const url = `https://wa.me/${contact.number}?text=${encodeURIComponent(message)}`
    
    trackEvent('lead', {
      value: product.price,
      meta: {
        type: 'product_whatsapp_click',
        productId: product.id,
        productName: product.name,
      },
    })
    
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const badgeText = showSubcategoryBadge && product.subcategory ? product.subcategory : product.category

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
      },
      quantity,
    )
    trackEvent('add_to_cart', {
      value: product.price * quantity,
      meta: {
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity,
      },
    })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <div className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 hover:border-[var(--orange-primary)]/40">
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Sem imagem
          </div>
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[var(--orange-primary)] text-white px-2.5 py-1 rounded-md shadow-sm z-10">
          {badgeText}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-xs text-[var(--orange-primary)] font-medium mt-0.5">{product.brand}</p>
          )}
          {product.dimensions && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{product.dimensions}</p>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Star size={12} className="text-[var(--orange-primary)] fill-[var(--orange-primary)]" />
            <span>4.8</span>
            <span>(128 avaliações)</span>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground">A partir de</p>
          <p className="text-xl font-bold text-foreground">{currency(product.price)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Em até 12x de {currency(product.price / 12)} sem juros
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <QuantityPicker value={quantity} onChange={setQuantity} />
          <span className="text-xs text-muted-foreground">
            Subtotal{' '}
            <span className="font-semibold text-foreground">{currency(product.price * quantity)}</span>
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`w-full inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm ${
            justAdded
              ? 'bg-green-600 hover:bg-green-600'
              : 'bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)]'
          }`}
        >
          {justAdded ? (
            <>
              <Check size={16} />
              Adicionado
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Adicionar {quantity > 1 ? `${quantity} ao carrinho` : 'ao carrinho'}
            </>
          )}
        </button>

        <button
          onClick={handleWhatsAppClick}
          className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors bg-[#25D366] hover:bg-[#20b858]"
        >
          <MessageCircle size={16} />
          Tirar duvidas
        </button>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'
