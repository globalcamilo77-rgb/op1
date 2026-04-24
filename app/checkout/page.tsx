'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Clock3,
  ShoppingCart,
  ArrowRight,
  QrCode,
  FileText,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/cart-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { useAddressStore } from '@/lib/address-store'
import { createOrder } from '@/lib/supabase-orders'
import { usePixStore } from '@/lib/pix-store'
import {
  usePaymentMethodsStore,
  type PaymentMethodId,
} from '@/lib/payment-methods-store'
import { PixPayment } from '@/components/store/pix-payment'
import { generatePixPayload, generateTxid } from '@/lib/pix-payload'
import type { GatewayChargeNormalized } from '@/lib/pix-gateway'

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clear } = useCartStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)
  const address = useAddressStore((state) => state.address)

  const pixConfig = usePixStore(
    useShallow((state) => ({
      enabled: state.enabled,
      discountPercent: state.discountPercent,
      pixKey: state.pixKey,
      beneficiaryName: state.beneficiaryName,
      beneficiaryCity: state.beneficiaryCity,
      showOnCheckout: state.showOnCheckout,
    })),
  )
  const addPixCharge = usePixStore((s) => s.addCharge)

  const paymentMethods = usePaymentMethodsStore(
    useShallow((state) => ({
      pix: state.pix,
      credit: state.credit,
      boleto: state.boleto,
      defaultMethod: state.defaultMethod,
    })),
  )

  const [mounted, setMounted] = useState(false)
  const [hasTrackedBegin, setHasTrackedBegin] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(paymentMethods.defaultMethod)
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerDocument, setBuyerDocument] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [gatewayCharge, setGatewayCharge] = useState<GatewayChargeNormalized | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const enabledMethods = useMemo<PaymentMethodId[]>(
    () =>
      (['pix', 'credit', 'boleto'] as PaymentMethodId[]).filter(
        (method) => paymentMethods[method].enabled,
      ),
    [paymentMethods],
  )

  useEffect(() => {
    if (!mounted) return
    if (enabledMethods.length === 0) return
    if (!enabledMethods.includes(paymentMethod)) {
      const next = enabledMethods.includes(paymentMethods.defaultMethod)
        ? paymentMethods.defaultMethod
        : enabledMethods[0]
      setPaymentMethod(next)
    }
  }, [mounted, enabledMethods, paymentMethod, paymentMethods.defaultMethod])

  const visibleItems = mounted ? items : []
  const subtotal = visibleItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = visibleItems.length > 0 ? 49.9 : 0
  const pixDiscountPercent = pixConfig.enabled ? pixConfig.discountPercent : 0
  const pixDiscount =
    paymentMethod === 'pix' && visibleItems.length > 0
      ? Number(((subtotal + shipping) * (pixDiscountPercent / 100)).toFixed(2))
      : 0
  const generalDiscount = visibleItems.length > 0 ? 35 : 0
  const discount = paymentMethod === 'pix' ? pixDiscount + generalDiscount : generalDiscount
  const total = Math.max(0, subtotal + shipping - discount)

  const pixOrderId = useMemo(() => generateTxid('OB'), [])

  useEffect(() => {
    if (!mounted || hasTrackedBegin || visibleItems.length === 0) return
    trackEvent('begin_checkout', {
      value: total,
      meta: {
        items: visibleItems.length,
        units: visibleItems.reduce((acc, i) => acc + i.quantity, 0),
      },
    })
    setHasTrackedBegin(true)
  }, [mounted, hasTrackedBegin, visibleItems, total, trackEvent])

  const validateBuyer = (): string | null => {
    if (!buyerName.trim() || buyerName.trim().length < 3) {
      return 'Informe seu nome completo.'
    }
    if (!isValidEmail(buyerEmail)) {
      return 'Informe um e-mail valido.'
    }
    const phoneDigits = sanitizeDigits(buyerPhone)
    if (phoneDigits.length < 10) {
      return 'Informe um telefone valido (com DDD).'
    }
    if (paymentMethod === 'pix') {
      const docDigits = sanitizeDigits(buyerDocument)
      if (docDigits.length !== 11 && docDigits.length !== 14) {
        return 'Informe um CPF ou CNPJ valido para gerar o PIX.'
      }
    }
    return null
  }

  const handleConfirmOrder = async () => {
    if (visibleItems.length === 0) return
    const validationError = validateBuyer()
    if (validationError) {
      setFormError(validationError)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setFormError(null)

    trackEvent('purchase', {
      value: total,
      meta: {
        items: visibleItems.length,
        units: visibleItems.reduce((acc, i) => acc + i.quantity, 0),
        paymentMethod,
      },
    })

    if (paymentMethod === 'pix' && pixConfig.enabled) {
      const fallbackPayload =
        pixConfig.pixKey
          ? generatePixPayload({
              pixKey: pixConfig.pixKey,
              beneficiaryName: pixConfig.beneficiaryName,
              beneficiaryCity: pixConfig.beneficiaryCity,
              amount: total,
              txid: pixOrderId,
              description: `Pedido ${pixOrderId}`,
            })
          : ''
      addPixCharge({
        amount: total,
        description: `Pedido checkout ${pixOrderId}`,
        customerName: buyerName || undefined,
        customerPhone: buyerPhone || undefined,
        customerEmail: buyerEmail || undefined,
        customerDocument: buyerDocument || undefined,
        orderId: pixOrderId,
        txid: pixOrderId,
        payload: gatewayCharge?.qrCode || fallbackPayload,
        gatewayProvider: gatewayCharge ? 'koliseu' : 'none',
        gatewayPaymentId: gatewayCharge?.id,
        gatewayQrImage: gatewayCharge?.qrCodeImage,
        gatewayStatus: gatewayCharge?.status,
        gatewayRaw: gatewayCharge?.raw,
      })
    }

    void createOrder({
      addressRaw: address?.rawInput,
      city: address?.city,
      postalCode: address?.postalCode,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod,
      status: paymentMethod === 'pix' ? 'awaiting_payment' : 'pending',
      items: visibleItems,
    })

    if (paymentMethod === 'pix') {
      setConfirmed(true)
      return
    }

    clear()
    router.push('/?obrigado=1')
  }

  const showCardForm = paymentMethod === 'credit'
  const showPixSection = paymentMethod === 'pix'
  const showBoletoSection = paymentMethod === 'boleto'

  const confirmLabel =
    paymentMethod === 'pix'
      ? 'Confirmar e gerar PIX'
      : paymentMethod === 'boleto'
        ? 'Gerar boleto'
        : 'Confirmar pedido'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-background">
          <div className="max-w-6xl mx-auto px-5 py-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground">Finalizacao segura</p>
                <h1 className="text-3xl font-bold tracking-tight mt-1">Checkout AlfaConstrução</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Revise os dados e confirme seu pedido em menos de 2 minutos.
                </p>
              </div>
              <Badge className="h-7 px-3 bg-[var(--success)]/15 text-green-800 border border-green-300">
                Ambiente protegido
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                <Truck className="size-4 text-[var(--orange-primary)]" />
                <span className="text-sm">Entrega programada</span>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                <CreditCard className="size-4 text-[var(--orange-primary)]" />
                <span className="text-sm">Pagamento em ate 12x</span>
              </div>
              <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                <Clock3 className="size-4 text-[var(--orange-primary)]" />
                <span className="text-sm">Separacao em ate 24h</span>
              </div>
            </div>
          </div>
        </section>

        {visibleItems.length === 0 ? (
          <section className="max-w-3xl mx-auto px-5 py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingCart className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Seu carrinho esta vazio</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione produtos antes de prosseguir para o checkout.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white rounded text-sm font-semibold transition-colors"
            >
              Voltar a loja
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : confirmed && paymentMethod === 'pix' ? (
          <section className="max-w-3xl mx-auto px-5 py-10">
            <Card className="border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={20} />
                  Pedido registrado! Agora e so pagar o PIX
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Seu pedido <strong>{pixOrderId}</strong> foi registrado. Pague o PIX abaixo para
                  liberar a separacao imediatamente.
                </p>
                <PixPayment
                  amount={total}
                  orderId={pixOrderId}
                  customerName={buyerName || undefined}
                  customerPhone={buyerPhone || undefined}
                  customerEmail={buyerEmail || undefined}
                  customerDocument={buyerDocument || undefined}
                  description={`Pedido ${pixOrderId}`}
                  onGatewayCharge={setGatewayCharge}
                />
                <div className="flex gap-3 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clear()
                      router.push('/?obrigado=1')
                    }}
                  >
                    Ja paguei, voltar a loja
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="max-w-6xl mx-auto px-5 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
              <div className="space-y-6">
                {formError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                    {formError}
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>1. Dados do comprador</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Nome completo"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                    />
                    <Input
                      placeholder={paymentMethod === 'pix' ? 'CPF (obrigatorio)' : 'CPF'}
                      value={buyerDocument}
                      onChange={(e) => setBuyerDocument(e.target.value)}
                    />
                    <Input
                      placeholder="E-mail"
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Telefone / WhatsApp"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Endereco de entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <Input placeholder="CEP" />
                    </div>
                    <div className="md:col-span-4">
                      <Input placeholder="Rua / Avenida" />
                    </div>
                    <div className="md:col-span-2">
                      <Input placeholder="Numero" />
                    </div>
                    <div className="md:col-span-4">
                      <Input placeholder="Complemento (opcional)" />
                    </div>
                    <div className="md:col-span-3">
                      <Input placeholder="Bairro" />
                    </div>
                    <div className="md:col-span-3">
                      <Input placeholder="Cidade / UF" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3. Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {enabledMethods.length === 0 ? (
                      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                        Nenhuma forma de pagamento esta disponivel no momento. Fale com a gente pelo
                        WhatsApp para finalizar.
                      </div>
                    ) : (
                      <div
                        className={`grid grid-cols-1 gap-3 ${
                          enabledMethods.length === 1
                            ? 'md:grid-cols-1'
                            : enabledMethods.length === 2
                              ? 'md:grid-cols-2'
                              : 'md:grid-cols-3'
                        }`}
                      >
                        {enabledMethods.includes('pix') && (
                          <PaymentMethodButton
                            active={paymentMethod === 'pix'}
                            onClick={() => setPaymentMethod('pix')}
                            icon={<QrCode size={16} />}
                            title={paymentMethods.pix.label}
                            subtitle={
                              pixDiscountPercent > 0
                                ? `${pixDiscountPercent}% off + ${paymentMethods.pix.subtitle.toLowerCase()}`
                                : paymentMethods.pix.subtitle
                            }
                          />
                        )}
                        {enabledMethods.includes('credit') && (
                          <PaymentMethodButton
                            active={paymentMethod === 'credit'}
                            onClick={() => setPaymentMethod('credit')}
                            icon={<CreditCard size={16} />}
                            title={paymentMethods.credit.label}
                            subtitle={paymentMethods.credit.subtitle}
                          />
                        )}
                        {enabledMethods.includes('boleto') && (
                          <PaymentMethodButton
                            active={paymentMethod === 'boleto'}
                            onClick={() => setPaymentMethod('boleto')}
                            icon={<FileText size={16} />}
                            title={paymentMethods.boleto.label}
                            subtitle={paymentMethods.boleto.subtitle}
                          />
                        )}
                      </div>
                    )}

                    {showPixSection && (
                      <div className="rounded-lg border border-dashed border-[var(--orange-primary)]/50 bg-[var(--orange-primary)]/5 p-4 flex items-start gap-3">
                        <Lock className="size-4 text-[var(--orange-primary)] mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-foreground">
                            O QR Code do PIX sera liberado apos a confirmacao.
                          </p>
                          <p className="text-muted-foreground mt-1">
                            Preencha nome, CPF, e-mail e telefone acima e clique em{' '}
                            <strong>&quot;Confirmar e gerar PIX&quot;</strong> para receber o QR
                            Code com o valor exato do pedido.
                          </p>
                        </div>
                      </div>
                    )}

                    {showCardForm && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="Nome impresso no cartao" />
                          <Input placeholder="Numero do cartao" />
                          <Input placeholder="Validade (MM/AA)" />
                          <Input placeholder="CVV" />
                        </div>
                        <div className="rounded-lg border border-[#0066cc]/20 bg-[#e8f2ff] p-3 text-sm text-[#0b4d8d]">
                          Parcelamento disponivel: ate 12x de {currency(total / 12)} sem juros.
                        </div>
                      </div>
                    )}

                    {showBoletoSection && (
                      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                        O boleto sera enviado para o seu e-mail apos a confirmacao do pedido. A
                        aprovacao ocorre em ate 1 dia util apos o pagamento.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <aside className="lg:sticky lg:top-6">
                <Card className="border-[var(--orange-primary)]/30">
                  <CardHeader>
                    <CardTitle>Resumo do pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {visibleItems.map((item) => (
                        <div
                          key={item.productId}
                          className="pb-3 border-b border-border last:border-b-0 last:pb-0 flex gap-3"
                        >
                          <div className="w-12 h-12 rounded bg-secondary overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">Sem foto</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                            <div className="flex items-center justify-between mt-2 text-sm">
                              <span>{item.quantity}x</span>
                              <span>{currency(item.quantity * item.price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{currency(subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Frete</span>
                        <span>{currency(shipping)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Desconto</span>
                        <span className="text-green-700">- {currency(discount)}</span>
                      </div>
                      {paymentMethod === 'pix' && pixDiscountPercent > 0 && (
                        <div className="text-xs text-green-700">
                          {pixDiscountPercent}% off aplicados pelo PIX
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold">{currency(total)}</span>
                    </div>

                    <Button
                      onClick={handleConfirmOrder}
                      disabled={enabledMethods.length === 0}
                      className="w-full h-11 text-base bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {confirmLabel}
                    </Button>

                    <div className="rounded-md border border-border p-3 text-xs text-muted-foreground flex gap-2">
                      <ShieldCheck className="size-4 mt-0.5 text-[var(--orange-primary)] shrink-0" />
                      Seus dados estao protegidos com criptografia e seu pagamento e processado em ambiente seguro.
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

function PaymentMethodButton({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-4 py-3 text-sm text-left transition-colors ${
        active
          ? 'border-[var(--orange-primary)] bg-[var(--orange-primary)]/10'
          : 'border-border hover:bg-secondary'
      }`}
    >
      <div className="flex items-center gap-2 font-semibold text-foreground">
        {icon}
        {title}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
    </button>
  )
}
