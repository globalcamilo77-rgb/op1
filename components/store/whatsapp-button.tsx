'use client'

import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAppearanceStore } from '@/lib/appearance-store'
import { useCitiesStore } from '@/lib/cities-store'

export function WhatsAppButton() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { contacts, defaultMessage, rotationIntervalMinutes } = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
      rotationIntervalMinutes: state.rotationIntervalMinutes,
    })),
  )
  const footerWhatsapp = useAppearanceStore((state) => state.footerWhatsapp)
  const getContactForCity = useCitiesStore((state) => state.getContactForCity)
  const getCityBySlug = useCitiesStore((state) => state.getCityBySlug)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Verificar se estamos em uma pagina de cidade
  const cityMatch = pathname?.match(/^\/cidade\/([^/]+)/)
  const citySlug = cityMatch ? cityMatch[1] : null
  const city = citySlug ? getCityBySlug(citySlug) : null

  let number: string | null = null
  let label: string | null = null
  let message = defaultMessage

  // Se estiver em pagina de cidade, usar contatos da cidade COM rotacao
  if (city && city.active) {
    const cityContact = getContactForCity(citySlug!)
    if (cityContact) {
      number = cityContact.number.replace(/\D/g, '')
      label = cityContact.label
      message = city.defaultMessage || defaultMessage
    }
  }
  
  // Se nao estiver em cidade ou nao tiver contato de cidade, usar primeiro contato global SEM rotacao
  if (!number) {
    const activeContacts = contacts.filter(
      (contact) => contact.active && contact.number.replace(/\D/g, '').length >= 10,
    )

    if (activeContacts.length > 0) {
      // Sem rotacao - sempre usa o primeiro contato ativo
      const chosen = activeContacts[0]
      number = chosen.number.replace(/\D/g, '')
      label = chosen.label
    } else {
      const fallback = (footerWhatsapp || '').replace(/\D/g, '')
      if (fallback.length >= 10) {
        number = fallback
      }
    }
  }

  if (!number) {
    return null
  }

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message || '')
    const whatsappUrl = `https://wa.me/${number}${encodedMessage ? `?text=${encodedMessage}` : ''}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label ? `Falar com ${label} no WhatsApp` : 'Fale conosco no WhatsApp'}
      className="group fixed bottom-6 right-6 bg-[var(--success)] text-white rounded-full flex items-center gap-2 shadow-xl z-50 transition-all hover:bg-[#20ba5a] hover:shadow-2xl hover:scale-105"
    >
      <span className="w-14 h-14 flex items-center justify-center">
        <MessageCircle size={28} />
      </span>
      <span className="pr-5 pl-1 font-semibold text-sm hidden sm:inline-block">
        Fale pelo WhatsApp
      </span>
      <span
        aria-hidden
        className="absolute top-1 right-1 flex h-3 w-3"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--orange-primary)] opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--orange-primary)]" />
      </span>
    </button>
  )
}
