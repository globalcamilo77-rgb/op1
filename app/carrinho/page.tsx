'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { WhatsAppButton } from '@/components/store/whatsapp-button'
import { useCartStore } from '@/lib/cart-store'

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, clear } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const visibleItems = mounted ? items : []
  const subtotal = visibleItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = visibleItems.length > 0 ? 20 : 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-foreground">Carrinho</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meu carrinho</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revise seus itens e finalize a compra com poucos cliques.
          </p>

          {visibleItems.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center mt-8">
              <div className="mx-auto w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingCart className="text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Seu carrinho esta vazio</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione produtos da nossa loja para comecar.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white rounded text-sm font-semibold transition-colors"
              >
                Ver produtos
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-start mt-6">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-foreground">
                    {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'itens'} no carrinho
                  </h2>
                  <button
                    onClick={() => clear()}
                    className="text-xs text-muted-foreground hover:text-red-600 inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Esvaziar carrinho
                  </button>
                </div>

                <ul>
                  {visibleItems.map((item) => (
                    <li key={item.productId} className="px-5 py-4 border-b border-border last:border-b-0 flex gap-4 items-center">
                      <div className="w-16 h-16 rounded bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Sem foto</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">Unidade: {currency(item.price)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right w-24">
                        <p className="text-sm font-semibold text-foreground">
                          {currency(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-red-600"
                        aria-label="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="lg:sticky lg:top-6">
                <div className="bg-card border border-[var(--orange-primary)]/30 rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Resumo</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{currency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frete estimado</span>
                      <span>{currency(shipping)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">{currency(total)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold px-4 py-3 rounded transition-colors"
                  >
                    Ir para o checkout
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/"
                    className="w-full inline-flex items-center justify-center text-sm text-[#0066cc] hover:underline"
                  >
                    Continuar comprando
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
