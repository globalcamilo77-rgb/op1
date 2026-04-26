'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { usePixStore } from '@/lib/pix-store'
import { generatePixPayload, generateTxid } from '@/lib/pix-payload'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { openWhatsApp } from '@/lib/whatsapp-link'
import { createGatewayPix, GatewayChargeNormalized } from '@/lib/pix-gateway'

interface PixPaymentProps {
  amount: number
  description?: string
  orderId?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerDocument?: string
  onCopied?: () => void
  onGatewayCharge?: (charge: GatewayChargeNormalized) => void
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function PixPayment({
  amount,
  description,
  orderId,
  customerName,
  customerPhone,
  customerEmail,
  customerDocument,
  onCopied,
  onGatewayCharge,
}: PixPaymentProps) {
  const router = useRouter()
  const pix = usePixStore()
  const whatsappContact = useWhatsAppStore((state) => state.getContactForCurrentWindow())
  const whatsappNumber = whatsappContact?.number ?? ''
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const [qrUrl, setQrUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [trackedSelected, setTrackedSelected] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const [gatewayCharge, setGatewayCharge] = useState<GatewayChargeNormalized | null>(null)
  const [gatewayLoading, setGatewayLoading] = useState(false)
  const [gatewayError, setGatewayError] = useState<string>('')
  const [serverHasKey, setServerHasKey] = useState<boolean | null>(null)
  const gatewayFiredRef = useRef<string>('')

  const txid = useMemo(() => generateTxid(orderId ? 'OB' : 'PX'), [orderId])

  // Verificar se o servidor tem a chave da API configurada
  useEffect(() => {
    fetch('/api/pix/config')
      .then((res) => res.json())
      .then((data) => {
        setServerHasKey(data.hasServerKey === true)
      })
      .catch(() => {
        setServerHasKey(false)
      })
  }, [])

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!gatewayCharge?.id || paymentConfirmed) return

    const checkPayment = async () => {
      try {
        setCheckingPayment(true)
        const res = await fetch(`/api/pix/status?id=${gatewayCharge.id}`)
        const data = await res.json()
        
        // Verificar diferentes formatos de resposta
        const status = data.data?.status || data.status
        if (status === 'paid' || status === 'completed' || status === 'PAID' || status === 'COMPLETED') {
          setPaymentConfirmed(true)
          
          // Bloquear IP e redirecionar
          await fetch('/api/pix/confirm-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderId || txid,
              transactionId: gatewayCharge.id,
              amount,
              customerName,
              customerEmail,
              customerPhone,
              customerDocument,
            }),
          })
          
          // Redirecionar para página de obrigado
          setTimeout(() => {
            router.push(`/obrigado?pedido=${orderId || txid}`)
          }, 2000)
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error)
      } finally {
        setCheckingPayment(false)
      }
    }

    // Verificar a cada 5 segundos
    const interval = setInterval(checkPayment, 5000)
    
    // Verificar imediatamente também
    checkPayment()

    return () => clearInterval(interval)
  }, [gatewayCharge?.id, paymentConfirmed, orderId, txid, amount, customerName, customerEmail, customerPhone, customerDocument, router])

  // Usar gateway se tem chave local OU se o servidor tem a chave configurada
  const shouldUseGateway =
    pix.gatewayEnabled &&
    pix.gatewayProvider !== 'none' &&
    (pix.gatewayApiKey.trim() !== '' || serverHasKey === true)

  useEffect(() => {
    if (!shouldUseGateway || amount <= 0) return
    const key = `${amount}|${orderId ?? txid}|${description ?? ''}`
    if (gatewayFiredRef.current === key) return
    gatewayFiredRef.current = key

    let cancelled = false
    setGatewayLoading(true)
    setGatewayError('')

    createGatewayPix({
      amountCents: Math.round(amount * 100),
      description: description || `Pedido ${orderId ?? txid}`,
      externalReference: orderId ?? txid,
      client: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        document: customerDocument,
      },
    }).then((result) => {
      if (cancelled) return
      if (!result.ok) {
        setGatewayError(result.error)
        setGatewayCharge(null)
      } else {
        setGatewayCharge(result.data)
        onGatewayCharge?.(result.data)
      }
      setGatewayLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [
    shouldUseGateway,
    amount,
    orderId,
    txid,
    description,
    customerName,
    customerPhone,
    customerEmail,
    customerDocument,
    pix.gatewayApiKey,
    pix.gatewayBaseUrl,
    onGatewayCharge,
  ])

  const localPayload = useMemo(() => {
    if (!pix.pixKey) return ''
    if (pix.staticPayload.trim()) return pix.staticPayload.trim()
    return generatePixPayload({
      pixKey: pix.pixKey,
      beneficiaryName: pix.beneficiaryName,
      beneficiaryCity: pix.beneficiaryCity,
      amount,
      txid,
      description,
    })
  }, [
    pix.pixKey,
    pix.beneficiaryName,
    pix.beneficiaryCity,
    pix.staticPayload,
    amount,
    txid,
    description,
  ])

  const payload = gatewayCharge?.qrCode || localPayload
  const gatewayQrImage = gatewayCharge?.qrCodeImage || ''

  useEffect(() => {
    if (gatewayQrImage) {
      setQrUrl('')
      return
    }
    if (!payload) {
      setQrUrl('')
      return
    }
    let cancelled = false
    QRCode.toDataURL(payload, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setQrUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [payload, gatewayQrImage])

  useEffect(() => {
    if (trackedSelected || !payload) return
    trackEvent('add_to_cart', {
      value: amount,
      meta: {
        kind: 'pix_selected',
        txid,
        ...(orderId ? { orderId } : {}),
        gateway: shouldUseGateway ? 'koliseu' : 'local',
      },
    })
    setTrackedSelected(true)
  }, [payload, trackedSelected, trackEvent, amount, txid, orderId, shouldUseGateway])

  const handleCopy = async () => {
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = payload
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
      } catch {}
      document.body.removeChild(textarea)
    }
    setCopied(true)
    onCopied?.()
    trackEvent('lead', {
      value: amount,
      meta: { type: 'pix_copied', txid, ...(orderId ? { orderId } : {}) },
    })
    window.setTimeout(() => setCopied(false), 2200)
  }

  const whatsappPlainText = `Ola! Paguei o PIX do pedido${
    orderId ? ` ${orderId}` : ''
  } no valor de ${currency(amount)}. Segue o comprovante.`
  const whatsappText = encodeURIComponent(whatsappPlainText)
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappText}`
    : undefined

  // Em desktop, evita o redirect via api.whatsapp.com (que falha em redes
  // com proxy) e abre WhatsApp Web direto. Em mobile, segue o href padrao.
  const handleWhatsAppClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!whatsappNumber) return
    event.preventDefault()
    openWhatsApp(whatsappNumber, whatsappPlainText)
  }

  if (!pix.enabled) {
    return (
      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        Pagamento via PIX indisponivel no momento.
      </div>
    )
  }

  // Aguardar verificação do servidor
  if (serverHasKey === null) {
    return (
      <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 size={16} className="animate-spin" />
        Carregando configuracao de pagamento...
      </div>
    )
  }

  if (!shouldUseGateway && !pix.pixKey && !pix.staticPayload) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        PIX ainda nao configurado. O super admin precisa cadastrar a chave PIX ou habilitar o
        gateway Koliseu em <span className="font-semibold">/admin/pix</span>.
      </div>
    )
  }

  // Exibir confirmação de pagamento
  if (paymentConfirmed) {
    return (
      <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-700 mb-2">
          Pagamento Confirmado!
        </h3>
        <p className="text-green-600 mb-4">
          Seu pagamento de {currency(amount)} foi recebido com sucesso.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <Loader2 size={16} className="animate-spin" />
          Redirecionando para a página de confirmação...
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--orange-primary)]/30 bg-gradient-to-b from-[var(--orange-primary)]/5 to-transparent p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <QrCode size={18} className="text-[var(--orange-primary)]" />
            Pague com PIX
            {shouldUseGateway && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold uppercase tracking-wide">
                <Zap size={10} /> Tempo real
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {pix.discountPercent > 0 ? (
              <>
                Voce ganha <strong>{pix.discountPercent}% off</strong> pagando via PIX. Aprovacao
                instantanea.
              </>
            ) : (
              'Aprovacao instantanea, sem taxas adicionais.'
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Valor</div>
          <div className="text-xl font-bold text-foreground">{currency(amount)}</div>
        </div>
      </div>

      {gatewayError && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex gap-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Gateway Koliseu falhou:</strong> {gatewayError}. Usando PIX estatico como
            alternativa.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 items-start">
        <div className="flex flex-col items-center gap-2">
          <div className="w-[200px] h-[200px] bg-white rounded-lg border border-border flex items-center justify-center overflow-hidden">
            {gatewayLoading ? (
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={20} className="animate-spin" />
                Gerando PIX...
              </div>
            ) : gatewayQrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gatewayQrImage}
                alt="QR Code PIX"
                className="w-full h-full object-contain"
              />
            ) : pix.customQrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pix.customQrUrl} alt="QR Code PIX" className="w-full h-full object-contain" />
            ) : qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR Code PIX" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">Gerando QR...</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground text-center max-w-[200px]">
            Abra o app do seu banco e use a leitura de QR Code
          </p>
          {gatewayCharge?.id && (
            <p className="text-[10px] text-muted-foreground font-mono">
              ID: {gatewayCharge.id.slice(0, 18)}
            </p>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              PIX Copia e Cola
            </div>
            <div className="relative">
              <textarea
                readOnly
                value={payload}
                className="w-full h-24 text-xs font-mono p-3 pr-12 rounded-md border border-border bg-background resize-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                disabled={!payload}
                className={`absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors disabled:opacity-50 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-[var(--orange-primary)] text-white hover:bg-[var(--orange-dark)]'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copiado
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-border bg-background p-2.5">
              <div className="text-muted-foreground">Beneficiario</div>
              <div className="font-semibold text-foreground">{pix.beneficiaryName || '-'}</div>
            </div>
            <div className="rounded-md border border-border bg-background p-2.5">
              <div className="text-muted-foreground">{pix.bankName ? 'Banco' : 'Cidade'}</div>
              <div className="font-semibold text-foreground">
                {pix.bankName || pix.beneficiaryCity || '-'}
              </div>
            </div>
          </div>

          {pix.instructions && (
            <div className="rounded-md border border-[#0066cc]/20 bg-[#e8f2ff] p-3 text-xs text-[#0b4d8d] flex gap-2">
              <ShieldCheck className="size-4 mt-0.5 shrink-0" />
              <span>{pix.instructions}</span>
            </div>
          )}

          {pix.whatsappConfirmEnabled && whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-md bg-[#25D366] hover:bg-[#20b858] text-white text-sm font-semibold transition-colors"
                  onClick={(event) => {
                    trackEvent('lead', {
                      value: amount,
                      meta: {
                        type: 'pix_whatsapp_click',
                        txid,
                        ...(orderId ? { orderId } : {}),
                      },
                    })
                    handleWhatsAppClick(event)
                  }}
                >
              <MessageCircle size={16} />
              Enviar comprovante pelo WhatsApp
            </a>
          )}

          {/* Botao Ja Paguei com verificacao */}
          {gatewayCharge?.id && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {checkingPayment ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-[var(--orange-primary)]" />
                      <span>Verificando pagamento...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Aguardando confirmacao do pagamento</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!gatewayCharge?.id) return
                    setCheckingPayment(true)
                    try {
                      const res = await fetch(`/api/pix/status?id=${gatewayCharge.id}`)
                      const data = await res.json()
                      const status = data.data?.status || data.status
                      if (status === 'paid' || status === 'completed' || status === 'PAID' || status === 'COMPLETED') {
                        setPaymentConfirmed(true)
                        await fetch('/api/pix/confirm-payment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: orderId || txid,
                            transactionId: gatewayCharge.id,
                            amount,
                            customerName,
                            customerEmail,
                            customerPhone,
                            customerDocument,
                          }),
                        })
                        setTimeout(() => {
                          router.push(`/obrigado?pedido=${orderId || txid}`)
                        }, 1500)
                      } else {
                        alert('Pagamento ainda nao confirmado. Aguarde alguns instantes e tente novamente.')
                      }
                    } catch (error) {
                      alert('Erro ao verificar pagamento. Tente novamente.')
                    } finally {
                      setCheckingPayment(false)
                    }
                  }}
                  disabled={checkingPayment}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[var(--orange-primary)] hover:bg-[var(--orange-dark)] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {checkingPayment ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Ja paguei
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                O sistema verifica automaticamente a cada 5 segundos. Clique em &quot;Ja paguei&quot; para verificar imediatamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
