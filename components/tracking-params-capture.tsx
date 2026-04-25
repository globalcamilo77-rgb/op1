'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTrackingParamsStore } from '@/lib/tracking-params-store'

/**
 * Captura parametros de tracking (UTM, gclid, fbclid, msclkid, etc.) da URL
 * e persiste em localStorage para que sigam o lead em todo o funil.
 *
 * Renderizado no layout raiz para rodar em qualquer landing.
 */
export function TrackingParamsCapture() {
  const searchParams = useSearchParams()
  const capture = useTrackingParamsStore((state) => state.capture)

  useEffect(() => {
    if (!searchParams) return
    capture(searchParams.toString())
  }, [searchParams, capture])

  return null
}
