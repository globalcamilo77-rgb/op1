'use client'

import { MessageCircle, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { useWhatsAppStore } from '@/lib/whatsapp-store'
import { useAppearanceStore } from '@/lib/appearance-store'
import { useCitiesStore } from '@/lib/cities-store'
import { useActiveCityStore } from '@/lib/active-city-store'
import { useTrackingParamsStore } from '@/lib/tracking-params-store'
import { useAnalyticsStore } from '@/lib/analytics-store'
import { openWhatsApp } from '@/lib/whatsapp-link'

interface AvailableContact {
  id: string
  label: string
  number: string
  source: 'city' | 'global'
}

// Sem fallback hardcoded: se nao houver contatos cadastrados em
// /adminlr/whatsapp, /adminlr/cidades ou no rodape de aparencia, o botao
// simplesmente nao aparece. Cadastre ao menos um numero no SuperAdmin para exibi-lo.

export function WhatsAppButton() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const { contacts, defaultMessage } = useWhatsAppStore(
    useShallow((state) => ({
      contacts: state.contacts,
      defaultMessage: state.defaultMessage,
    })),
  )
  const footerWhatsapp = useAppearanceStore((state) => state.footerWhatsapp)
  const cities = useCitiesStore((state) => state.cities)
  const getCityBySlug = useCitiesStore((state) => state.getCityBySlug)
  const activeCitySlug = useActiveCityStore((state) => state.slug)
  const trackingParams = useTrackingParamsStore((state) => state.params)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fecha painel ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!open) return
    const onClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return
      if (!panelRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const cityFromPath = useMemo(() => {
    if (!mounted) return null
    const cityMatch = pathname?.match(/^\/cidade\/([^/]+)/)
    const slug = cityMatch ? cityMatch[1] : activeCitySlug
    if (!slug) return null
    const city = getCityBySlug(slug)
    return city && city.active ? city : null
  }, [mounted, pathname, activeCitySlug, getCityBySlug])

  // Lista todos os contatos disponiveis: contatos da cidade ativa (se em /cidade/[slug])
  // + contatos globais + contatos de todas as outras cidades ativas como opcao secundaria.
  const availableContacts = useMemo<AvailableContact[]>(() => {
    if (!mounted) return []
    const items: AvailableContact[] = []
    const seen = new Set<string>()

    const push = (
      raw: { id?: string; label?: string; number?: string },
      source: 'city' | 'global',
      labelOverride?: string,
    ) => {
      const digits = (raw.number || '').replace(/\D/g, '')
      if (digits.length < 10) return
      if (seen.has(digits)) return
      seen.add(digits)
      items.push({
        id: raw.id || `${source}-${digits}`,
        label: labelOverride || raw.label || (source === 'city' ? 'Atendimento local' : 'WhatsApp'),
        number: digits,
        source,
      })
    }

    // 1) Contatos da cidade ativa primeiro (so quando estamos em /cidade/[slug])
    if (cityFromPath) {
      for (const c of cityFromPath.contacts || []) {
        if (c.active) push(c, 'city')
      }
    }

    // 2) Contatos globais cadastrados em /adminlr/whatsapp
    for (const c of contacts) {
      if (c.active) push(c, 'global')
    }

    // 3) Contatos de TODAS as outras cidades ativas (na home/loja viram a unica fonte)
    for (const otherCity of cities) {
      if (!otherCity.active) continue
      if (cityFromPath && otherCity.slug === cityFromPath.slug) continue
      for (const c of otherCity.contacts || []) {
        if (!c.active) continue
        push(
          c,
          'global',
          `${c.label || 'Atendimento'} - ${otherCity.cityName}`,
        )
      }
    }

    // 4) Fallback do rodape (se cadastrado em /adminlr/aparencia)
    if (items.length === 0) {
      const fallback = (footerWhatsapp || '').replace(/\D/g, '')
      if (fallback.length >= 10) {
        items.push({
          id: 'footer-fallback',
          label: 'Fale conosco',
          number: fallback,
          source: 'global',
        })
      }
    }

    return items
  }, [mounted, cityFromPath, contacts, footerWhatsapp, cities])

  if (!mounted || availableContacts.length === 0) {
    return null
  }

  const buildMessage = (contact: AvailableContact) => {
    let finalMessage =
      (contact.source === 'city' && cityFromPath?.defaultMessage) || defaultMessage || ''
    const trackingEntries = Object.entries(trackingParams).filter(([, v]) => v && v.length > 0)
    if (trackingEntries.length > 0) {
      const trackingTag = trackingEntries.map(([k, v]) => `${k}=${v}`).join(' | ')
      finalMessage = `${finalMessage}\n\n[origem: ${trackingTag}]`.trim()
    }
    return finalMessage
  }

  // Quando ha 1 unico contato, comportamento "click direto" (igual antes).
  const handleMainClick = () => {
    if (availableContacts.length === 1) {
      const c = availableContacts[0]
      // Dispara evento de lead para o Google Analytics/GTM
      trackEvent('lead', {
        meta: {
          type: 'floating_whatsapp_click',
          contactLabel: c.label,
          source: c.source,
          page: pathname,
        },
      })
      openWhatsApp(c.number, buildMessage(c))
      return
    }
    setOpen((prev) => !prev)
  }

  const handleContactClick = (contact: AvailableContact) => {
    // Dispara evento de lead para o Google Analytics/GTM
    trackEvent('lead', {
      meta: {
        type: 'floating_whatsapp_click',
        contactLabel: contact.label,
        source: contact.source,
        page: pathname,
      },
    })
    openWhatsApp(contact.number, buildMessage(contact))
    setOpen(false)
  }

  const totalContacts = availableContacts.length

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && totalContacts > 1 ? (
        <div
          role="dialog"
          aria-label="Escolher numero do WhatsApp"
          className="w-[19rem] max-w-[calc(100vw-3rem)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="flex items-center justify-between bg-[var(--success)] text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-semibold text-sm">Fale com a gente</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="rounded-full p-1 hover:bg-white/15 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-4 pt-3 pb-2 text-xs text-gray-500">
            Escolha o numero para iniciar a conversa.
          </div>
          <ul className="max-h-72 overflow-y-auto pb-2">
            {availableContacts.map((contact) => (
              <li key={contact.id}>
                <button
                  type="button"
                  onClick={() => handleContactClick(contact)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]">
                    <MessageCircle size={18} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 truncate">
                      {contact.label}
                    </span>
                    <span className="block text-xs text-gray-500 font-mono">
                      {formatPhone(contact.number)}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-[var(--success)]">Abrir</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleMainClick}
        title="Fale conosco no WhatsApp"
        aria-expanded={open}
        aria-haspopup={totalContacts > 1}
        className="group relative bg-[var(--success)] text-white rounded-full flex items-center gap-2 shadow-xl transition-all hover:bg-[#20ba5a] hover:shadow-2xl hover:scale-105"
      >
        <span className="w-14 h-14 flex items-center justify-center">
          <MessageCircle size={28} />
        </span>
        <span className="pr-5 pl-1 font-semibold text-sm hidden sm:inline-block">
          Fale pelo WhatsApp
        </span>
        {totalContacts > 1 ? (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-[var(--orange-primary)] text-[10px] font-bold ring-2 ring-white"
          >
            {totalContacts}
          </span>
        ) : (
          <span aria-hidden className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--orange-primary)] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--orange-primary)]" />
          </span>
        )}
      </button>
    </div>
  )
}

function formatPhone(digits: string) {
  // Formata 55XX9XXXXXXXX -> +55 (XX) 9XXXX-XXXX (best effort)
  if (digits.length === 13 && digits.startsWith('55')) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 12 && digits.startsWith('55')) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`
  }
  return digits
}
