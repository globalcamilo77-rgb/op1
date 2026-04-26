'use client'

import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'

interface Props {
  productId: string
  productName: string
  price: number
  ctaText: string
  ctaMessage: string
  size?: 'md' | 'lg'
}

const currency = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ProductLPCta({
  productName,
  price,
  ctaText,
  ctaMessage,
  size = 'md',
}: Props) {
  const [loading, setLoading] = useState(false)

  const open = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp', { cache: 'no-store' })
      const data = await res.json()
      const number =
        data?.contact?.number ||
        data?.contacts?.[0]?.number ||
        data?.number ||
        ''
      if (!number) {
        alert('Nenhum WhatsApp configurado. Tente novamente em instantes.')
        return
      }

      const message =
        ctaMessage ||
        `Olá! Tenho interesse em comprar:\n\n*${productName}*\nValor: ${currency(price)}\n\nPoderia me ajudar?`
      const url = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (e) {
      console.error('[lp-cta] erro', e)
      alert('Não foi possível abrir o WhatsApp agora.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={open}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-bold text-white bg-[var(--success,_#16a34a)] hover:bg-emerald-700 transition-colors disabled:opacity-60 ${
        size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm'
      }`}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 20 : 16} className="animate-spin" />
      ) : (
        <MessageCircle size={size === 'lg' ? 20 : 16} />
      )}
      {ctaText}
    </button>
  )
}
