'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MapPin, X } from 'lucide-react'
import { useActiveCityStore } from '@/lib/active-city-store'
import { useTrackedHref } from '@/lib/tracking-params-store'

export function ActiveCityBanner() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  const slug = useActiveCityStore((state) => state.slug)
  const cityName = useActiveCityStore((state) => state.cityName)
  const state = useActiveCityStore((state) => state.state)
  const clearActiveCity = useActiveCityStore((s) => s.clearActiveCity)
  const trackedHref = useTrackedHref()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !slug || !cityName) return null

  // Esconde o banner enquanto o lead esta na propria landing da cidade
  if (pathname?.startsWith(`/cidade/${slug}`)) return null

  return (
    <div className="bg-[var(--orange-primary)] text-white py-2 px-4 text-sm flex items-center justify-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 font-semibold">
        <MapPin size={14} />
        <span>
          Atendimento exclusivo para {cityName}
          {state ? ` - ${state}` : ''}
        </span>
      </div>
      <a
        href={trackedHref(`/cidade/${slug}`)}
        className="underline underline-offset-2 hover:no-underline font-medium"
      >
        Ver oferta da cidade
      </a>
      <button
        type="button"
        onClick={clearActiveCity}
        className="inline-flex items-center gap-1 text-white/80 hover:text-white transition-colors text-xs"
        aria-label="Sair do atendimento da cidade"
      >
        <X size={12} /> sair
      </button>
    </div>
  )
}
