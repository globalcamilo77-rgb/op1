'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Truck, X, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import {
  useAddressStore,
  detectCityFromInput,
  extractPostalCode,
  SERVICED_CITIES,
} from '@/lib/address-store'
import { useAnalyticsStore } from '@/lib/analytics-store'

type DialogStep = 'greeting' | 'success' | 'error'

export function ServiceAreaDialog() {
  const { address, isDialogOpen, hasDismissed, setAddress, openDialog, closeDialog } =
    useAddressStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<DialogStep>('greeting')
  const [detectedCity, setDetectedCity] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!address && !hasDismissed) {
      openDialog()
    }
  }, [mounted, address, hasDismissed, openDialog])

  useEffect(() => {
    if (isDialogOpen) {
      setStep('greeting')
      setInput('')
      setError(null)
      setDetectedCity(null)
    }
  }, [isDialogOpen])

  if (!mounted || !isDialogOpen) {
    return null
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      setError('Digite seu CEP para verificarmos.')
      return
    }

    const city = detectCityFromInput(trimmed)
    const postalCode = extractPostalCode(trimmed)

    if (!city) {
      setDetectedCity(null)
      setStep('error')
      return
    }

    setDetectedCity(city)
    setStep('success')
    trackEvent('lead', {
      meta: {
        type: 'cep_capture',
        city,
        postalCode: postalCode ?? '',
      },
    })
  }

  const handleConfirm = () => {
    const trimmed = input.trim()
    const city = detectCityFromInput(trimmed)
    const postalCode = extractPostalCode(trimmed)
    
    if (city) {
      setAddress({ rawInput: trimmed, city, postalCode })
      setInput('')
      setError(null)
      setStep('greeting')
    }
  }

  const handleTryAgain = () => {
    setStep('greeting')
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

        {step === 'greeting' && (
          <div className="px-6 pt-6 pb-7 text-center">
            <h2 className="text-xl md:text-2xl font-extrabold leading-snug flex items-center justify-center gap-2">
              <MapPin size={24} />
              Bem-vindo a AlfaConstrucao!
            </h2>

            <p className="text-sm md:text-[15px] font-semibold mt-3 leading-relaxed">
              Para oferecer o melhor atendimento, precisamos verificar se atendemos sua regiao.
              Digite seu CEP abaixo:
            </p>

            <form onSubmit={onSubmit} className="mt-5 text-left">
              <label htmlFor="service-area-input" className="block text-sm font-semibold mb-1">
                Digite seu CEP
              </label>
              <input
                id="service-area-input"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="ex: 18900-000"
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
                Verificar
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="px-6 pt-6 pb-7 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-extrabold leading-snug">
              Otimo! Nos atendemos a sua area!
            </h2>

            <p className="text-sm md:text-[15px] font-semibold mt-3 leading-relaxed">
              {detectedCity && (
                <>Identificamos que voce esta em <strong>{detectedCity}</strong>. </>
              )}
              Estamos prontos para entregar os melhores materiais de construcao para voce!
            </p>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full mt-5 h-11 rounded-full bg-[var(--orange-dark)] hover:bg-[#b86a00] transition-colors font-extrabold text-base tracking-wide shadow-md"
            >
              Comecar a comprar
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="px-6 pt-6 pb-7 text-center">
            <h2 className="text-lg md:text-xl font-extrabold leading-snug flex items-center justify-center gap-2">
              <AlertTriangle size={20} />
              Ops! Sua obra esta fora da nossa area de atuacao!
            </h2>

            <p className="text-sm md:text-[15px] font-semibold mt-3 leading-relaxed">
              Atendemos as seguintes regioes:{' '}
              {SERVICED_CITIES.join(', ')}.
            </p>

            <div className="mt-5 text-left">
              <label htmlFor="service-area-retry" className="block text-sm font-semibold mb-1">
                Digite outro CEP
              </label>
              <input
                id="service-area-retry"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="ex: 18900-000"
                className="w-full h-11 rounded-md px-4 text-sm text-foreground bg-white border border-white/30 outline-none focus:ring-2 focus:ring-white/70"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={handleTryAgain}
                className="flex-1 h-11 rounded-full bg-white/20 hover:bg-white/30 transition-colors font-extrabold text-base tracking-wide"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => {
                  const city = detectCityFromInput(input.trim())
                  if (city) {
                    setDetectedCity(city)
                    setStep('success')
                  }
                }}
                className="flex-1 h-11 rounded-full bg-[var(--orange-dark)] hover:bg-[#b86a00] transition-colors font-extrabold text-base tracking-wide shadow-md"
              >
                Verificar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
