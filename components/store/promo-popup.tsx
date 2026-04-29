'use client'

import { useState, useEffect } from 'react'
import { X, Gift, MessageCircle } from 'lucide-react'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { openWhatsApp } from '@/lib/whatsapp-link'
import { useAnalyticsStore } from '@/lib/analytics-store'

const POPUP_STORAGE_KEY = 'alfaconstrucao-promo-popup-dismissed'
const POPUP_DELAY_MS = 8000 // 8 segundos apos carregar a pagina

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const getContact = useWhatsAppStore((s) => s.registerClickAndGetContact)
  const defaultMessage = useWhatsAppStore((s) => s.defaultMessage)
  const trackEvent = useAnalyticsStore((s) => s.trackEvent)

  useEffect(() => {
    setMounted(true)
    
    // Verifica se ja foi fechado recentemente (24h)
    const dismissed = localStorage.getItem(POPUP_STORAGE_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const hoursSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60)
      if (hoursSinceDismiss < 24) return
    }

    // Mostra o popup apos delay
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, POPUP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString())
  }

  const handleRedeemDiscount = () => {
    const contact = getContact()
    if (!contact) {
      handleClose()
      return
    }

    const message = `Ola! Vim pelo site e quero resgatar meu cupom de 10% de DESCONTO! 🎁`
    
    trackEvent('lead', {
      meta: {
        type: 'promo_popup_click',
        source: 'promo_popup',
      },
    })

    openWhatsApp(contact.number, message)
    handleClose()
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Botao fechar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Conteudo */}
        <div className="p-6 pt-8 text-center text-white">
          {/* Icone */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <Gift size={32} className="text-white" />
          </div>

          {/* Titulo */}
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
            GANHE 10% DE DESCONTO!
          </h2>
          
          {/* Subtitulo */}
          <p className="text-white/90 text-sm md:text-base mb-6">
            Exclusivo para novos clientes. Resgate agora pelo WhatsApp e economize na sua obra!
          </p>

          {/* Codigo do cupom */}
          <div className="bg-white/20 rounded-lg px-4 py-3 mb-6 inline-block">
            <p className="text-xs text-white/80 uppercase tracking-wider mb-1">Cupom</p>
            <p className="text-2xl font-black tracking-widest">ALFA10</p>
          </div>

          {/* Botao CTA */}
          <button
            onClick={handleRedeemDiscount}
            className="w-full flex items-center justify-center gap-2 bg-white text-orange-600 font-extrabold py-4 px-6 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            <MessageCircle size={20} />
            Resgatar meu desconto
          </button>

          {/* Texto pequeno */}
          <p className="text-xs text-white/70 mt-4">
            Valido para primeira compra. Nao acumulativo.
          </p>
        </div>

        {/* Decoracao */}
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}
