'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { Check, MessageCircle, ShoppingCart, Star, Info, X } from 'lucide-react'
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
  const [showDetails, setShowDetails] = useState(false)

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
          onClick={() => setShowDetails(true)}
          className="w-full inline-flex items-center justify-center gap-2 text-foreground text-sm font-semibold px-4 py-2 rounded-lg transition-colors bg-secondary hover:bg-secondary/80 border border-border"
        >
          <Info size={16} />
          Ver Detalhes
        </button>

        <button
          onClick={handleWhatsAppClick}
          className="w-full inline-flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors bg-[#25D366] hover:bg-[#20b858]"
        >
          <MessageCircle size={16} />
          Tirar duvidas
        </button>
      </div>

      {/* Modal de Detalhes */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {product.image ? (
                <div className="relative aspect-video">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-secondary rounded-t-2xl flex items-center justify-center text-muted-foreground">
                  Sem imagem
                </div>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-wider bg-[var(--orange-primary)] text-white px-3 py-1.5 rounded-lg">
                {product.category}
              </span>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
              
              {product.brand && (
                <p className="text-sm text-[var(--orange-primary)] font-medium mt-1">
                  Marca: {product.brand}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-[var(--orange-primary)] fill-[var(--orange-primary)]" />
                  <span className="font-medium">4.8</span>
                </div>
                <span className="text-muted-foreground text-sm">(128 avaliações)</span>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-2">Descrição do Produto</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description || `${product.name} de alta qualidade. Produto ideal para sua obra, com garantia de procedência e melhor custo-benefício da região. Disponível para entrega rápida.`}
                </p>
              </div>

              {product.dimensions && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-2">Especificações</h4>
                  <p className="text-sm text-muted-foreground">
                    Dimensões: {product.dimensions}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">A partir de</p>
                <p className="text-2xl font-bold text-foreground">{currency(product.price)}</p>
                <p className="text-sm text-muted-foreground">
                  Em até 12x de {currency(product.price / 12)} sem juros
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleAdd()
                    setShowDetails(false)
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-4 py-3 rounded-lg bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] transition-colors"
                >
                  <ShoppingCart size={18} />
                  Adicionar ao Carrinho
                </button>
                <button
                  onClick={handleWhatsAppClick}
                  className="inline-flex items-center justify-center gap-2 text-white text-sm font-bold px-4 py-3 rounded-lg bg-[#25D366] hover:bg-[#20b858] transition-colors"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

ProductCard.displayName = 'ProductCard'
