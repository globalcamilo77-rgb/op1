'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { usePathname } from 'next/navigation'

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function FloatingCart() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [wasJustUpdated, setWasJustUpdated] = useState(false)
  
  const items = useCartStore((state) => state.items)
  const itemCount = useCartStore((state) => state.itemCount())
  const subtotal = useCartStore((state) => state.subtotal())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Anima quando adiciona item
  useEffect(() => {
    if (itemCount > 0) {
      setWasJustUpdated(true)
      const timer = setTimeout(() => setWasJustUpdated(false), 600)
      return () => clearTimeout(timer)
    }
  }, [itemCount])

  // Nao mostra em certas paginas
  const hiddenPaths = ['/checkout', '/carrinho', '/obrigado', '/pix', '/adminlr']
  const shouldHide = hiddenPaths.some((p) => pathname.startsWith(p))

  if (!mounted || itemCount === 0 || shouldHide) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-2">
      {/* Painel expandido */}
      {isExpanded && (
        <div className="bg-card border border-border rounded-xl shadow-2xl w-72 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-3 border-b border-border bg-secondary/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Seu Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto p-2 space-y-2">
            {items.slice(0, 4).map((item) => (
              <div key={item.productId} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity}x {currency(item.price)}
                  </p>
                </div>
              </div>
            ))}
            {items.length > 4 && (
              <p className="text-xs text-center text-muted-foreground py-1">
                +{items.length - 4} {items.length - 4 === 1 ? 'item' : 'itens'}
              </p>
            )}
          </div>
          
          <div className="p-3 border-t border-border bg-secondary/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="text-base font-bold text-foreground">{currency(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white text-sm font-bold rounded-lg transition-colors"
            >
              Finalizar Pedido
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Botao flutuante */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          relative flex items-center gap-2 px-4 py-3 
          bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] 
          text-white font-bold rounded-full shadow-lg 
          transition-all duration-200
          ${wasJustUpdated ? 'scale-110' : 'scale-100'}
        `}
      >
        <ShoppingCart size={20} />
        <span className="text-sm">Ver Carrinho</span>
        
        {/* Badge com quantidade */}
        <span className="absolute -top-2 -right-2 bg-white text-[var(--orange-primary)] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-[var(--orange-primary)]">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </button>
    </div>
  )
}
