'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Truck, Clock, Home, Loader2 } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'

function ObrigadoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('pedido')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
              <p className="text-green-100">
                Pagamento confirmado com sucesso
              </p>
            </div>

            {/* Detalhes do pedido */}
            <div className="p-6 md:p-8">
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Numero do pedido</p>
                  <p className="text-xl font-bold text-foreground font-mono">{orderId}</p>
                </div>
              )}

              {/* Timeline do pedido */}
              <div className="space-y-4 mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Proximos passos
                </h2>
                
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pagamento confirmado</p>
                    <p className="text-sm text-muted-foreground">Seu pagamento foi recebido com sucesso</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-[var(--orange-primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Separacao do pedido</p>
                    <p className="text-sm text-muted-foreground">Estamos preparando seus produtos</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Truck size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Entrega</p>
                    <p className="text-sm text-muted-foreground">Em breve seus produtos estarao a caminho</p>
                  </div>
                </div>
              </div>

              {/* Informacoes adicionais */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 flex gap-3">
                <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Prazo de entrega</p>
                  <p>Voce recebera um contato via WhatsApp com informacoes sobre a entrega do seu pedido.</p>
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
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-background">
        <StoreHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[var(--orange-primary)]" size={32} />
        </div>
        <Footer />
      </div>
    }>
      <ObrigadoContent />
    </Suspense>
  )
}
