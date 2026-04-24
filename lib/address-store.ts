import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const SERVICED_CITIES = [
  'Americana',
  'Aruja',
  'Barueri',
  'Campinas',
  'Guarulhos',
  'Indaiatuba',
  'Jundiai',
  'Limeira',
  'Valinhos',
  'Osasco',
  'Piracicaba',
  'Rio Claro',
  'Vale do Paraiba',
  'Votorantim',
  'Sorocaba',
] as const

export interface SelectedAddress {
  rawInput: string
  city?: string
  postalCode?: string
}

interface AddressState {
  address: SelectedAddress | null
  isDialogOpen: boolean
  hasDismissed: boolean
  setAddress: (address: SelectedAddress) => void
  clearAddress: () => void
  openDialog: () => void
  closeDialog: () => void
  dismiss: () => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      address: null,
      isDialogOpen: false,
      hasDismissed: false,

      setAddress: (address) => set({ address, isDialogOpen: false, hasDismissed: true }),
      clearAddress: () => set({ address: null }),
      openDialog: () => set({ isDialogOpen: true }),
      closeDialog: () => set({ isDialogOpen: false, hasDismissed: true }),
      dismiss: () => set({ hasDismissed: true, isDialogOpen: false }),
    }),
    {
      name: 'alfaconstrucao-address',
      partialize: (state) => ({
        address: state.address,
        hasDismissed: state.hasDismissed,
      }),
    },
  ),
)

const CEP_REGEX = /\d{5}-?\d{3}/

export function detectCityFromInput(input: string): string | undefined {
  const normalized = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return SERVICED_CITIES.find((city) => {
    const normalizedCity = city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return normalized.includes(normalizedCity)
  })
}

export function extractPostalCode(input: string): string | undefined {
  const match = input.match(CEP_REGEX)
  return match?.[0]
}
