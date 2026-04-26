'use client'

import { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAnalyticsStore } from '@/lib/analytics-store'

export interface OrderReportItem {
  name: string
  quantity: number
  unitPrice: number
}

interface WhatsAppReportButtonProps {
  orderId: string
  customerName: string
  customerPhone?: string
  customerDocument?: string
  paymentMethod: string
  status: string
  items: OrderReportItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  city?: string
}

function currency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function paymentMethodLabel(method: string) {
  switch (method) {
    case 'pix':
      return 'PIX'
    case 'credit':
      return 'Cartao de Credito'
    case 'boleto':
      return 'Boleto'
    default:
      return method
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'PAGO / Confirmado'
    case 'awaiting_payment':
      return 'Aguardando pagamento'
    case 'pending':
      return 'Pendente'
    default:
      return status
  }
}

export function WhatsAppReportButton(props: WhatsAppReportButtonProps) {
  const registerClickAndGetContact = useWhatsAppStore(
    (state) => state.registerClickAndGetContact,
  )
  const previewContact = useWhatsAppStore((state) =>
    state.getContactForCurrentClickBlock(),
  )
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  // Mensagem completa de relatorio do pedido
  const message = useMemo(() => {
    const lines: string[] = []
    lines.push('*Confirmacao de Pedido - AlfaConstrucao*')
    lines.push('')
    lines.push(`Pedido: *${props.orderId.slice(0, 18)}*`)
    lines.push(`Status: *${statusLabel(props.status)}*`)
    lines.push(`Pagamento: ${paymentMethodLabel(props.paymentMethod)}`)
    lines.push('')
    lines.push('*Cliente*')
    lines.push(`Nome: ${props.customerName}`)
    if (props.customerPhone) lines.push(`Telefone: ${props.customerPhone}`)
    if (props.customerDocument) lines.push(`CPF/CNPJ: ${props.customerDocument}`)
    if (props.city) lines.push(`Cidade: ${props.city}`)
    lines.push('')
    lines.push('*Itens do pedido*')
    props.items.forEach((item, idx) => {
      lines.push(
        `${idx + 1}. ${item.name} - ${item.quantity}x ${currency(item.unitPrice)} = *${currency(
          item.quantity * item.unitPrice,
        )}*`,
      )
    })
    lines.push('')
    lines.push('*Resumo*')
    lines.push(`Subtotal: ${currency(props.subtotal)}`)
    lines.push(`Frete: ${currency(props.shipping)}`)
    if (props.discount > 0) lines.push(`Descontos: -${currency(props.discount)}`)
    lines.push(`*TOTAL: ${currency(props.total)}*`)
    lines.push('')
    lines.push(
      props.status === 'paid' || props.status === 'completed'
        ? 'Acabei de finalizar este pedido. Pode confirmar a separacao e entrega?'
        : 'Estou enviando os detalhes do meu pedido para acompanhamento. Aguardo retorno.',
    )
    return lines.join('\n')
  }, [props])

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const contact = registerClickAndGetContact() || previewContact
    if (!contact || !contact.number) {
      alert(
        'Nenhum numero de WhatsApp esta cadastrado. Por favor, fale com o suporte.',
      )
      return
    }

    trackEvent('lead', {
      value: props.total,
      meta: {
        type: 'order_report_whatsapp',
        orderId: props.orderId,
        contactId: contact.id,
        contactLabel: contact.label,
      },
    })

    const cleanNumber = contact.number.replace(/\D/g, '')
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <a
      href="#"
      onClick={handleClick}
      className="group inline-flex items-center justify-center gap-3 w-full px-6 py-4 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
    >
      <MessageCircle className="size-5" />
      <span>Enviar relatorio do pedido pelo WhatsApp</span>
    </a>
  )
}
