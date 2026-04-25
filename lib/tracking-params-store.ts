'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Parametros que o Google Ads, Meta, GA e demais plataformas usam
const TRACKED_KEYS = [
  // UTM padrao (Google/GA)
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  // Google Ads
  'gclid',
  'gad_source',
  'gad_campaignid',
  'gbraid',
  'wbraid',
  // Meta (Facebook/Instagram)
  'fbclid',
  // Microsoft Ads
  'msclkid',
  // TikTok
  'ttclid',
  // Linkedin
  'li_fat_id',
] as const

type TrackedKey = (typeof TRACKED_KEYS)[number]

type TrackingParams = Partial<Record<TrackedKey, string>>

interface TrackingParamsState {
  params: TrackingParams
  capturedAt: string | null
  capture: (search: string) => void
  clear: () => void
}

export const useTrackingParamsStore = create<TrackingParamsState>()(
  persist(
    (set, get) => ({
      params: {},
      capturedAt: null,
      capture: (search) => {
        if (!search) return
        const sp = new URLSearchParams(search)
        const next: TrackingParams = {}
        let changed = false
        for (const key of TRACKED_KEYS) {
          const value = sp.get(key)
          if (value && value.trim().length > 0) {
            next[key] = value
            changed = true
          }
        }
        if (changed) {
          // Mescla com o que ja tinha (mantem campanha original se nova URL nao traz params)
          set({
            params: { ...get().params, ...next },
            capturedAt: new Date().toISOString(),
          })
        }
      },
      clear: () => set({ params: {}, capturedAt: null }),
    }),
    {
      name: 'tracking-params-v1',
    }
  )
)

/**
 * Concatena os parametros de tracking salvos a uma URL interna.
 * Usar em todos os links (botoes, <a>, router.push) que precisam manter a campanha.
 */
export function appendTrackingParams(href: string, params: TrackingParams): string {
  if (!href || Object.keys(params).length === 0) return href

  // Nao mexer em URLs externas (http:// ou https://) que nao sejam do proprio dominio
  // Excecao: wa.me e api.whatsapp.com tambem se beneficiam dos UTMs no texto
  const isExternal = /^https?:\/\//i.test(href)
  if (isExternal && !/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
    return href
  }

  // Para links de WhatsApp, embutir UTM no parametro "text" e nao no proprio link
  // (esses tracker sao tratados separadamente em outro helper)
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
    return href
  }

  // Separar hash (#anchor)
  const [pathAndQuery, hash] = href.split('#')
  const [path, query = ''] = pathAndQuery.split('?')

  const sp = new URLSearchParams(query)
  for (const [k, v] of Object.entries(params)) {
    if (v && !sp.has(k)) {
      sp.set(k, v)
    }
  }

  const qs = sp.toString()
  const finalUrl = qs ? `${path}?${qs}` : path
  return hash ? `${finalUrl}#${hash}` : finalUrl
}

/**
 * Hook auxiliar que retorna a funcao "withTracking" pronta para uso em links.
 */
export function useTrackedHref() {
  const params = useTrackingParamsStore((state) => state.params)
  return (href: string) => appendTrackingParams(href, params)
}
