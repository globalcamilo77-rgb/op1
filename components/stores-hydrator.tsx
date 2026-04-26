'use client'

import { useEffect } from 'react'
import { useCitiesStore } from '@/lib/cities-store'
import { useWhatsAppStore } from '@/lib/whatsapp-store'

/**
 * Componente invisivel que carrega dados do Supabase no boot da aplicacao.
 * Garante que clientes vejam cidades e contatos cadastrados no admin
 * (que ficavam apenas no localStorage do admin antes).
 *
 * Eh montado no root layout para rodar uma unica vez por sessao.
 */
export function StoresHydrator() {
  const loadCities = useCitiesStore((state) => state.loadFromSupabase)
  const loadWhatsapp = useWhatsAppStore((state) => state.loadFromSupabase)

  useEffect(() => {
    loadCities()
    loadWhatsapp()
  }, [loadCities, loadWhatsapp])

  return null
}
