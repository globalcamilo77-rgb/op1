'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  Home,
  Loader2,
  Receipt,
  ShieldCheck,
  User,
  Hash,
} from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { WhatsAppReportButton, type OrderReportItem } from './whatsapp-report-button'
import { useWhatsAppStore } from '@/lib/whatsapp-store'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

interface OrderItemRow {
  product_id?: string
  name?: string
  category?: string
  unit_price?: number
  quantity?: number
  image?: string | null
}

interface NotesPayload {
  address_raw?: string | null
  city?: string | null
  postal_code?: string | null
  subtotal?: number
  shipping?: number
  discount?: number
}

interface PurchaseOrder {
  id: string
  total: number
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  customer_document?: string | null
  payment_method?: string | null
  paid_at?: string | null
  status?: string | null
  items?: unknown
  notes?: string | null
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function paymentMethodLabel(method: string | null | undefined) {
  switch (method) {
    case 'pix':
      return 'PIX'
    case 'credit':
      return 'Cartao de Credito'
    case 'boleto':
      return 'Boleto'
    default:
      return method ?? 'Nao informado'
  }
}

function isPaid(status?: string | null) {
  if (!status) return false
  const s = status.toLowerCase()
  return s === 'paid' || s === 'completed'
}

function parseItems(raw: unknown): OrderItemRow[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as OrderItemRow[]
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as OrderItemRow[]) : []
    } catch {
      return []
    }
  }
  return []
}

function parseNotes(raw: string | null | undefined): NotesPayload {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as NotesPayload
    return parsed || {}
  } catch {
    return {}
  }
}

function ObrigadoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('pedido')
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const registerClickAndGetContact = useWhatsAppStore((s) => s.registerClickAndGetContact)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar pedido e disparar evento purchase. Faz polling a cada 4s
  // enquanto o status nao for "paid", por ate 30 minutos. Assim, quando a
  // Koliseu confirma o pagamento via webhook, a /obrigado se atualiza
  // automaticamente e dispara a conversao no Google Ads / GA4.
  useEffect(() => {
    if (!mounted || !orderId) {
      setLoading(false)
      return
    }

    let cancelled = false
    let pollTimer: ReturnType<typeof setTimeout> | null = null
    const startedAt = Date.now()
    const maxPollMs = 30 * 60 * 1000 // 30 minutos
    const pollIntervalMs = 4000

    const fetchAndTrack = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (!cancelled) setLoading(false)
          return
        }
        const data = await res.json()
        if (cancelled) return

        const fetched: PurchaseOrder | null = data?.order ?? null
        if (!fetched) {
          setLoading(false)
          return
        }

        setOrder(fetched)
        setLoading(false)

        // Tracking purchase apenas quando o pedido foi efetivamente PAGO
        // (status paid/completed). Para PIX pendente nao disparamos para nao
        // contaminar o painel de conversoes do Ads/GA4.
        if (!isPaid(fetched.status)) {
          // Se o pedido tem pix_transaction_id, chama /api/pix/status para
          // verificar com a Koliseu se ja foi pago. Essa chamada dispara o
          // webhook local (Pushcut + bloqueio IP + update no Supabase) se
          // detectar que foi pago. Assim nao dependemos da Koliseu chamar
          // nosso webhook — verificamos ativamente.
          const pixTxId = (fetched as { pix_transaction_id?: string }).pix_transaction_id
          if (pixTxId) {
            try {
              console.log('[v0] Verificando status PIX com Koliseu:', pixTxId)
              await fetch(`/api/pix/status?id=${encodeURIComponent(pixTxId)}`, {
                cache: 'no-store',
              })
            } catch (err) {
              console.error('[v0] Erro ao verificar status PIX:', err)
            }
          }

          // Reagenda polling enquanto nao esgotar o tempo limite
          if (Date.now() - startedAt < maxPollMs && !cancelled) {
            pollTimer = setTimeout(fetchAndTrack, pollIntervalMs)
          }
          return
        }

        // Apenas uma vez por pedido (localStorage = persiste mesmo se o
        // cliente recarregar ou voltar pela URL).
        const trackedKey = `purchase_tracked_${fetched.id}`
        if (typeof window === 'undefined') return
        if (window.localStorage.getItem(trackedKey)) return

        const value = Number(fetched.total) || 0
        const transactionId = String(fetched.id)
        const orderCurrency = 'BRL'

        // Items detalhados para Enhanced Ecommerce (GA4 + Ads remarketing)
        const trackedItems = parseItems(fetched.items).map((it, idx) => ({
          item_id: it.product_id ?? `item-${idx}`,
          item_name: it.name ?? 'Produto',
          item_category: it.category ?? undefined,
          price: Number(it.unit_price) || 0,
          quantity: Number(it.quantity) || 1,
        }))

        // GTM dataLayer (GA4 e qualquer outra tag conectada)
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: transactionId,
            value,
            currency: orderCurrency,
            payment_type: fetched.payment_method || 'pix',
            items: trackedItems,
          },
        })

        // GA4 direto via gtag (caso GTM nao esteja com tag de purchase)
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'purchase', {
            transaction_id: transactionId,
            value,
            currency: orderCurrency,
            items: trackedItems,
          })

          // Google Ads — Conversion event. Sem o label correto a conversao
          // nao e contabilizada no painel do Ads, so aparece no GA4.
          const adsId = 'AW-17985777423'
          const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || ''
          if (conversionLabel) {
            window.gtag('event', 'conversion', {
              send_to: `${adsId}/${conversionLabel}`,
              transaction_id: transactionId,
              value,
              currency: orderCurrency,
            })
          } else {
            // Fallback: pelo menos sinaliza que houve uma conversao para o
            // remarketing do Ads aprender que esse usuario comprou.
            window.gtag('event', 'conversion', {
              send_to: adsId,
              transaction_id: transactionId,
              value,
              currency: orderCurrency,
            })
          }
        }

        window.localStorage.setItem(trackedKey, '1')
      } catch (err) {
        console.error('[obrigado] erro ao buscar pedido:', err)
        if (!cancelled) {
          setLoading(false)
          // Tenta de novo em 8s caso seja erro de rede transitorio
          if (Date.now() - startedAt < maxPollMs) {
            pollTimer = setTimeout(fetchAndTrack, pollIntervalMs * 2)
          }
        }
      }
    }

    fetchAndTrack()
    return () => {
      cancelled = true
      if (pollTimer) clearTimeout(pollTimer)
    }
  }, [mounted, orderId])

  const items = useMemo(() => parseItems(order?.items), [order?.items])
  const notes = useMemo(() => parseNotes(order?.notes), [order?.notes])

  const subtotal =
    notes.subtotal ??
    items.reduce(
      (acc, item) => acc + (item.unit_price ?? 0) * (item.quantity ?? 0),
      0,
    )
  const shipping = notes.shipping ?? 0
  const discount = notes.discount ?? 0
  const total = order?.total
    ? Number(order.total)
    : Math.max(0, subtotal + shipping - discount)
  const paid = isPaid(order?.status)

  const reportItems: OrderReportItem[] = items.map((item) => ({
    name: item.name || 'Produto',
    quantity: item.quantity ?? 1,
    unitPrice: item.unit_price ?? 0,
  }))

  if (!mounted || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[var(--orange-primary)]" size={32} />
      </div>
    )
  }

  return (
    <main className="flex-1 py-10 px-4 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        {/* Header de sucesso */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
          <div
            className={`p-8 text-center text-white ${
              paid
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600'
            }`}
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {paid ? (
                <CheckCircle2 size={48} className="text-white" />
              ) : (
                <Clock size={44} className="text-white" />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-balance">
              {paid
                ? 'Obrigado! Pagamento confirmado.'
                : order
                  ? 'Pedido registrado! Agora e so pagar.'
                  : 'Pedido nao encontrado.'}
            </h1>
            <p className={paid ? 'text-emerald-50' : 'text-amber-50'}>
              {paid
                ? 'Seu pedido entrou em separacao.'
                : order
                  ? 'Assim que o PIX cair, sua entrega entra em rota.'
                  : 'Confira se o numero do pedido esta correto.'}
            </p>
          </div>

          {orderId && (
            <div className="px-6 md:px-8 py-4 border-b border-border flex items-center justify-center gap-2">
              <Hash size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pedido:</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {String(orderId).slice(0, 18)}
              </span>
            </div>
          )}
        </div>

        {!order ? (
          <div className="text-center py-8">
            <Link
              href="/loja"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white font-semibold transition-colors"
            >
              <Home size={16} />
              Voltar para a loja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
            {/* Coluna esquerda: itens + cliente + timeline */}
            <div className="space-y-6">
              {/* Itens do pedido */}
              <section className="rounded-xl border border-border bg-card overflow-hidden">
                <header className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <Package size={18} className="text-[var(--orange-primary)]" />
                  <h2 className="text-base font-bold">Itens do pedido</h2>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </span>
                </header>
                {items.length === 0 ? (
                  <p className="p-5 text-sm text-muted-foreground">
                    Nao ha itens registrados neste pedido.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {items.map((item, idx) => (
                      <li
                        key={`${item.product_id ?? idx}-${idx}`}
                        className="flex items-start gap-3 p-4"
                      >
                        <div className="w-14 h-14 shrink-0 rounded-md border border-border bg-secondary/40 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name ?? 'Produto'}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <Package size={20} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground line-clamp-2">
                            {item.name ?? 'Produto'}
                          </div>
                          {item.category && (
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
                              {item.category}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.quantity ?? 1}x {currency(item.unit_price ?? 0)}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-foreground whitespace-nowrap">
                          {currency((item.unit_price ?? 0) * (item.quantity ?? 0))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Cliente */}
              <section className="rounded-xl border border-border bg-card">
                <header className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <User size={18} className="text-[var(--orange-primary)]" />
                  <h2 className="text-base font-bold">Dados do cliente</h2>
                </header>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-5 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                      Nome
                    </dt>
                    <dd className="font-semibold text-foreground mt-0.5">
                      {order.customer_name || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                      Telefone
                    </dt>
                    <dd className="font-semibold text-foreground mt-0.5">
                      {order.customer_phone || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                      E-mail
                    </dt>
                    <dd className="font-semibold text-foreground mt-0.5 break-all">
                      {order.customer_email || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                      CPF/CNPJ
                    </dt>
                    <dd className="font-semibold text-foreground mt-0.5">
                      {order.customer_document || '-'}
                    </dd>
                  </div>
                  {notes.address_raw && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                        Endereco
                      </dt>
                      <dd className="text-foreground mt-0.5">
                        {notes.address_raw}
                        {notes.city ? `, ${notes.city}` : ''}
                        {notes.postal_code ? ` - CEP ${notes.postal_code}` : ''}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Timeline */}
              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-base font-bold mb-4">Proximos passos</h2>
                <ol className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">
                        {paid ? 'Pagamento confirmado' : 'Pedido registrado'}
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {paid
                          ? 'Sua compra foi recebida com sucesso.'
                          : 'Estamos aguardando a compensacao do pagamento.'}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        paid ? 'bg-orange-100' : 'bg-secondary'
                      }`}
                    >
                      <Package
                        size={18}
                        className={paid ? 'text-[var(--orange-primary)]' : 'text-muted-foreground'}
                      />
                    </div>
                    <div className="text-sm">
                      <p className={paid ? 'font-semibold' : 'font-semibold text-muted-foreground'}>
                        Separacao
                      </p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Estamos preparando seus produtos.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-muted-foreground" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-muted-foreground">Entrega</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Em breve seus produtos estarao a caminho.
                      </p>
                    </div>
                  </li>
                </ol>
              </section>
            </div>

            {/* Coluna direita: resumo + WhatsApp + voltar */}
            <aside className="space-y-4 lg:sticky lg:top-4">
              <section className="rounded-xl border border-border bg-card">
                <header className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <Receipt size={18} className="text-[var(--orange-primary)]" />
                  <h2 className="text-base font-bold">Resumo</h2>
                </header>
                <dl className="px-5 py-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-semibold">{currency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Frete</dt>
                    <dd className="font-semibold">{currency(shipping)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <dt>Descontos</dt>
                      <dd className="font-semibold">- {currency(discount)}</dd>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between items-baseline">
                    <dt className="text-sm font-bold">Total</dt>
                    <dd className="text-xl font-bold text-foreground">
                      {currency(total)}
                    </dd>
                  </div>
                </dl>
                <div className="px-5 pb-5 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-secondary/60 p-2.5 text-center">
                    <div className="text-muted-foreground">Pagamento</div>
                    <div className="font-semibold mt-0.5">
                      {paymentMethodLabel(order.payment_method)}
                    </div>
                  </div>
                  <div
                    className={`rounded-md p-2.5 text-center ${
                      paid
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <div className="opacity-80">Status</div>
                    <div className="font-semibold mt-0.5">
                      {paid ? 'Confirmado' : 'Aguardando'}
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA WhatsApp - diferente para pago vs pendente */}
              {paid ? (
                <section className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-emerald-700" />
                    <h3 className="text-sm font-bold text-foreground">
                      Rastreie seu pedido
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Seu pagamento foi confirmado! Clique abaixo para acompanhar
                    o status da sua entrega em tempo real pelo WhatsApp.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      const contact = registerClickAndGetContact()
                      if (!contact) return
                      const msg = `Ola! Gostaria de rastrear meu pedido ${order.id.slice(0, 8).toUpperCase()}\n\nNome: ${order.customer_name || 'Cliente'}\nValor: ${currency(total)}`
                      window.open(
                        `https://wa.me/${contact.number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
                  >
                    <Truck size={16} />
                    Rastrear meu pedido
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    <Clock size={12} />
                    <span>Resposta em ate 5 minutos durante horario comercial.</span>
                  </div>
                </section>
              ) : (
                <section className="rounded-xl border-2 border-[#25D366]/40 bg-[#25D366]/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <h3 className="text-sm font-bold text-foreground">
                      Confirme com nosso atendente
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Clique abaixo para abrir o WhatsApp ja com o relatorio completo
                    do seu pedido. Apenas envie a mensagem para acelerar a separacao
                    e a entrega.
                  </p>

                  <WhatsAppReportButton
                    orderId={order.id}
                    customerName={order.customer_name || 'Cliente'}
                    customerPhone={order.customer_phone ?? undefined}
                    customerDocument={order.customer_document ?? undefined}
                    paymentMethod={order.payment_method || 'pix'}
                    status={order.status || 'pending'}
                    items={reportItems}
                    subtotal={subtotal}
                    shipping={shipping}
                    discount={discount}
                    total={total}
                    city={notes.city ?? undefined}
                  />

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                    <Truck size={12} />
                    <span>Atendimento humano para confirmar separacao e prazos.</span>
                  </div>
                </section>
              )}

              <Link
                href="/loja"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md border border-border bg-card hover:bg-secondary text-sm font-semibold transition-colors"
              >
                <Home size={14} />
                Continuar comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ObrigadoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-[var(--orange-primary)]" size={32} />
          </div>
        }
      >
        <ObrigadoContent />
      </Suspense>
      <Footer />
    </div>
  )
}
