'use client'

import { useEffect } from 'react'
import { useActiveCityStore } from '@/lib/active-city-store'

/**
 * Componente client-side mudo que apenas seta a cidade ativa no Zustand store
 * assim que monta. Usado por /cidade/[slug] para deixar todos os componentes
 * da loja (header, hero, footer etc) ja saberem que estamos numa cidade
 * especifica.
 */
export function CityActivator({
  slug,
  cityName,
  state,
}: {
  slug: string
  cityName: string
  state?: string | null
}) {
  const setActiveCity = useActiveCityStore((s) => s.setActiveCity)

  useEffect(() => {
    setActiveCity(slug, cityName, state ?? undefined)
  }, [slug, cityName, state, setActiveCity])

  return null
}
