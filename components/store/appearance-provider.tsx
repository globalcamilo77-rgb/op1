'use client'

import { useEffect } from 'react'
import { useAppearanceStore } from '@/lib/appearance-store'

export function AppearanceProvider() {
  const primaryColor = useAppearanceStore((state) => state.primaryColor)
  const primaryDarkColor = useAppearanceStore((state) => state.primaryDarkColor)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--orange-primary', primaryColor)
    root.style.setProperty('--orange-dark', primaryDarkColor)
  }, [primaryColor, primaryDarkColor])

  return null
}
