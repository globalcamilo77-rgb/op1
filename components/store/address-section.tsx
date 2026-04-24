'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, MapPin, AlertTriangle, Truck, PencilLine } from 'lucide-react'
import {
  SERVICED_CITIES,
  detectCityFromInput,
  extractPostalCode,
  useAddressStore,
} from '@/lib/address-store'
import { useAnalyticsStore } from '@/lib/analytics-store'

export function AddressSection() {
  const { address, setAddress, clearAddress } = useAddressStore()
  const trackEvent = useAnalyticsStore((state) => state.trackEvent)

  const [mounted, setMounted] = useState(false)
  const [inputAddress, setInputAddress] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = inputAddress.trim()
    if (!trimmed) {
      setError('Informe o endereco ou CEP da sua obra.')
      return
    }

    const city = detectCityFromInput(trimmed)
    const postalCode = extractPostalCode(trimmed)

    if (!city) {
      setError(
        'Nao identificamos uma cidade atendida. Digite o nome da cidade completo ou um CEP valido da nossa area.',
      )
      return
    }

    const fullRaw = [trimmed, number && `n ${number}`, complement].filter(Boolean).join(', ')
    setAddress({ rawInput: fullRaw, city, postalCode })
    trackEvent('lead', {
      meta: {
        type: 'cep_capture_home',
        city,
        postalCode: postalCode ?? '',
      },
    })
    setError(null)
  }

  const handleEdit = () => {
    if (address) {
      setInputAddress(address.rawInput.split(',')[0] ?? '')
    }
    clearAddress()
  }

  if (!mounted) return null

  const isServiced = !!address?.city

  if (isServiced) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-green-300 bg-gradient-to-br from-green-50 via-white to-white p-6 my-6 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-green-200/40 blur-2xl"
        />

        <div className="relative flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md shrink-0">
            <CheckCircle2 size={26} />
          </div>

          <div className="flex-1 min-w-[240px]">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <Truck size={12} />
              Atendemos sua região
            </div>
            <h2 className="text-lg md:text-xl font-bold text-foreground mt-2 leading-tight">
              Entregamos em{' '}
              <span className="text-green-700">{address.city}</span>!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {address.postalCode ? (
                <>
                  CEP <strong className="text-foreground">{address.postalCode}</strong> •{' '}
                </>
              ) : null}
              Produtos e preços já ajustados para sua região.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin size={14} className="text-green-600" />
              <span className="truncate">{address.rawInput}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors shrink-0"
          >
            <PencilLine size={14} />
            Alterar endereço
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--info-bg)] border-l-4 border-[var(--info-border)] p-6 my-6 rounded-lg">
      <h2 className="text-lg font-bold mb-3 text-foreground flex items-center gap-2">
        <MapPin size={18} className="text-[var(--info-border)]" />
        Onde está sua obra?
      </h2>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Precisamos saber onde está sua obra. Os <strong>produtos</strong> e{' '}
        <strong>preços</strong> variam conforme a cidade informada.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="flex flex-col">
          <label htmlFor="address" className="text-xs text-muted-foreground mb-1 font-medium">
            Endereço ou CEP
          </label>
          <input
            type="text"
            id="address"
            placeholder="Ex: Rua Um, 1000 ou 18900-000"
            value={inputAddress}
            onChange={(event) => {
              setInputAddress(event.target.value)
              if (error) setError(null)
            }}
            required
            className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="number" className="text-xs text-muted-foreground mb-1 font-medium">
            Número
          </label>
          <input
            type="text"
            id="number"
            placeholder="Ex: 234N"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="complement" className="text-xs text-muted-foreground mb-1 font-medium">
            Complemento
          </label>
          <input
            type="text"
            id="complement"
            placeholder="Ex: Bloco A"
            value={complement}
            onChange={(event) => setComplement(event.target.value)}
            className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className="bg-[var(--orange-primary)] text-white px-6 py-2 rounded font-bold text-sm hover:bg-[var(--orange-dark)] transition-colors"
          >
            Continuar
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-3">
        <strong>Cidades atendidas:</strong> {SERVICED_CITIES.join(', ')}.
      </p>
    </div>
  )
}
