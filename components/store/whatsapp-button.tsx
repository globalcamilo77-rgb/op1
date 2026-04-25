'use client'

import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAppearanceStore } from '@/lib/appearance-store'
import { useCitiesStore } from '@/lib/cities-store'
import { useActiveCityStore } from '@/lib/active-city-store'
import { useTrackingParamsStore } from '@/lib/tracking-params-store'

export function WhatsAppButton() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const {
    contacts,
    defaultMessage,
    getContactForCurrentClickBlock,
    registerClickAndGetContact,
  } = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
      getContactForCurrentClickBlock: state.getContactForCurrentClickBlock,
      registerClickAndGetContact: state.registerClickAndGetContact,
    })),
  )
  const footerWhatsapp = useAppearanceStore((state) => state.footerWhatsapp)
  const getContactForCity = useCitiesStore((state) => state.getContactForCity)
  const getCityBySlug = useCitiesStore((state) => state.getCityBySlug)
  const activeCitySlug = useActiveCityStore((state) => state.slug)
  const trackingParams = useTrackingParamsStore((state) => state.params)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Prioridade 1: pagina de cidade (rota direta)
  // Prioridade 2: cidade ativa salva (lead navegou a partir de uma /cidade/[slug])
  const cityMatch = pathname?.match(/^\/cidade\/([^/]+)/)
  const citySlug = cityMatch ? cityMatch[1] : activeCitySlug
  const city = citySlug ? getCityBySlug(citySlug) : null

  let number: string | null = null
  let label: string | null = null
  let message = defaultMessage
  // Quando estiver em uma pagina de cidade, ignoramos a rotacao por cliques (atendente fixo).
  let useClickRotation = false

  if (city && city.active) {
    const cityContact = getContactForCity(citySlug!)
    if (cityContact) {
      number = cityContact.number.replace(/\D/g, '')
      label = cityContact.label
      message = city.defaultMessage || defaultMessage
    }
  }

  // Fora de paginas de cidade: rotacao por blocos de cliques (default 10 cliques por contato)
  if (!number) {
    const blockContact = getContactForCurrentClickBlock()
    if (blockContact) {
      number = blockContact.number.replace(/\D/g, '')
      label = blockContact.label
      useClickRotation = true
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
    // Se estamos em modo rotacao por cliques, registramos o clique e usamos o contato resultante
    // (que pode ja ser o proximo da fila se o clique fechou o bloco atual).
    let targetNumber = number!
    let targetLabel = label
    if (useClickRotation) {
      const next = registerClickAndGetContact()
      if (next) {
        targetNumber = next.number.replace(/\D/g, '')
        targetLabel = next.label
      }
    }

    let finalMessage = message || ''

    // Anexa origem da campanha ao final da mensagem para o atendente saber a origem do lead
    const trackingEntries = Object.entries(trackingParams).filter(([, v]) => v && v.length > 0)
    if (trackingEntries.length > 0) {
      const trackingTag = trackingEntries.map(([k, v]) => `${k}=${v}`).join(' | ')
      finalMessage = `${finalMessage}\n\n[origem: ${trackingTag}]`.trim()
    }

    void targetLabel // evita warning de variavel nao usada
    const encodedMessage = encodeURIComponent(finalMessage)
    const whatsappUrl = `https://wa.me/${targetNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  // contacts referenciado para garantir reatividade
  void contacts

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
