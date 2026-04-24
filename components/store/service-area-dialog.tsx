'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Truck, X, AlertTriangle } from 'lucide-react'
import {
  useAddressStore,
  detectCityFromInput,
  extractPostalCode,
  SERVICED_CITIES,
} from '@/lib/address-store'
import { useAnalyticsStore } from '@/lib/analytics-store'

export function ServiceAreaDialog() {
  const { address, isDialogOpen, hasDismissed, setAddress, openDialog, closeDialog } =
    useAddressStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!address && !hasDismissed) {
      openDialog()
    }
  }, [mounted, address, hasDismissed, openDialog])

  if (!mounted || !isDialogOpen) {
    return null
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Digite seu endereco ou CEP.')
      return
    }

    const city = detectCityFromInput(trimmed)
    const postalCode = extractPostalCode(trimmed)

    if (!city) {
      setError(
        'Nao identificamos uma cidade atendida. Digite o nome da sua cidade ou um CEP valido da area.',
      )
      return
    }

    setAddress({ rawInput: trimmed, city, postalCode })
    trackEvent('lead', {
      meta: {
        type: 'cep_capture',
        city,
        postalCode: postalCode ?? '',
      },
    })
    setInput('')
    setError(null)
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl bg-[var(--orange-primary)] text-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-end p-3">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => closeDialog()}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="bg-white rounded-xl py-5 px-6 flex items-center justify-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="AlfaConstrução" className="h-16 w-auto object-contain" />
            <Truck size={40} className="text-[var(--orange-primary)]" />
          </div>
        </div>

        <div className="px-6 pt-6 pb-7 text-center">
          <h2 className="text-lg md:text-xl font-extrabold leading-snug flex items-center justify-center gap-2">
            <AlertTriangle size={20} />
            Ops! Verificamos que sua obra esta fora da nossa area de atuacao!
          </h2>

          <p className="text-sm md:text-[15px] font-semibold mt-3 leading-relaxed">
            Altere o endereco ou CEP da sua obra para as regioes atendidas pela ALFACONSTRUÇÃO:{' '}
            {SERVICED_CITIES.join(', ')}.
          </p>

          <form onSubmit={onSubmit} className="mt-5 text-left">
            <label htmlFor="service-area-input" className="block text-sm font-semibold mb-1">
              Digite seu endereco ou CEP
            </label>
            <input
              id="service-area-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value)
                if (error) setError(null)
              }}
              placeholder="ex: Rua Um, no 1000 ou 18900-000"
              className="w-full h-11 rounded-md px-4 text-sm text-foreground bg-white border border-white/30 outline-none focus:ring-2 focus:ring-white/70"
            />

            {error && (
              <p className="text-xs font-semibold mt-2 bg-white/15 rounded px-2 py-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-5 h-11 rounded-full bg-[var(--orange-dark)] hover:bg-[#b86a00] transition-colors font-extrabold text-base tracking-wide shadow-md"
            >
              Alterar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
