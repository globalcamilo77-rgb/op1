'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Truck, Clock, Home, Loader2 } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

interface PurchaseOrder {
  id: string
  total: number
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  payment_method?: string | null
  paid_at?: string | null
  status?: string | null
}

function ObrigadoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('pedido')
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar pedido e disparar evento purchase
  useEffect(() => {
    if (!mounted || !orderId) return

    let cancelled = false

    const fetchAndTrack = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return

        const fetched: PurchaseOrder | null = data?.order ?? null
        if (!fetched) return

        setOrder(fetched)

        // Garantir que o evento so dispara uma vez por pedido (preview, hot reload, etc)
        const trackedKey = `purchase_tracked_${fetched.id}`
        if (typeof window !== 'undefined' && window.sessionStorage.getItem(trackedKey)) {
          return
        }

        const value = Number(fetched.total) || 0
        const transactionId = String(fetched.id)
        const currency = 'BRL'

        if (typeof window !== 'undefined') {
          // dataLayer (GTM, GA4, Google Ads via tag manager)
          window.dataLayer = window.dataLayer || []
          window.dataLayer.push({
            event: 'purchase',
            ecommerce: {
              transaction_id: transactionId,
              value,
              currency,
              payment_type: fetched.payment_method || 'pix',
            },
          })

          // gtag direto (caso voce use Google tag/Google Ads sem GTM)
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'purchase', {
              transaction_id: transactionId,
              value,
              currency,
            })
          }

          window.sessionStorage.setItem(trackedKey, '1')
          console.log('[v0] Purchase event disparado:', { transactionId, value, currency })
        }
      } catch (err) {
        console.error('[v0] Erro ao buscar pedido para tracking:', err)
      }
    }

    fetchAndTrack()
    return () => {
      cancelled = true
    }
  }, [mounted, orderId])

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--orange-primary)]" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
            {/* Header com icone de sucesso */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Obrigado pela sua compra!
              </h1>
              <p className="text-green-100">Pagamento confirmado com sucesso</p>
            </div>

            {/* Detalhes do pedido */}
            <div className="p-6 md:p-8">
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Numero do pedido</p>
                  <p className="text-xl font-bold text-foreground font-mono">{orderId}</p>
                  {order?.total ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      Valor:{' '}
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(order.total))}
                      </span>
                    </p>
                  ) : null}
                </div>
              )}

              {/* Timeline do pedido */}
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Proximos passos</h2>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pagamento confirmado</p>
                    <p className="text-sm text-muted-foreground">
                      Seu pagamento foi recebido com sucesso
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-[var(--orange-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Separacao do pedido</p>
                    <p className="text-sm text-muted-foreground">
                      Estamos preparando seus produtos
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Truck size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Entrega</p>
                    <p className="text-sm text-muted-foreground">
                      Em breve seus produtos estarao a caminho
                    </p>
                  </div>
                </div>
              </div>

              {/* Informacoes adicionais */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 flex gap-3">
                <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Prazo de entrega</p>
                  <p>
                    Voce recebera um contato via WhatsApp com informacoes sobre a entrega do seu
                    pedido.
                  </p>
                </div>
              </div>

              {/* Botoes de acao */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-semibold transition-colors"
                >
                  <Home size={18} />
                  Voltar para a loja
                </Link>
              </div>
            </div>
          </div>

          {/* Mensagem adicional */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Duvidas? Entre em contato conosco pelo WhatsApp
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ObrigadoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <StoreHeader />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--orange-primary)]" size={32} />
          </div>
          <Footer />
        </div>
      }
    >
      <ObrigadoContent />
    </Suspense>
  )
}
