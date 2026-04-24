import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaymentMethodId = 'pix' | 'credit' | 'boleto'

export interface PaymentMethodConfig {
  enabled: boolean
  label: string
  subtitle: string
}

export interface PaymentMethodsSettings {
  pix: PaymentMethodConfig
  credit: PaymentMethodConfig
  boleto: PaymentMethodConfig
  defaultMethod: PaymentMethodId
}

interface PaymentMethodsState extends PaymentMethodsSettings {
  update: (patch: Partial<PaymentMethodsSettings>) => void
  toggle: (method: PaymentMethodId, enabled: boolean) => void
  setSubtitle: (method: PaymentMethodId, subtitle: string) => void
  setLabel: (method: PaymentMethodId, label: string) => void
  setDefaultMethod: (method: PaymentMethodId) => void
  reset: () => void
  getEnabledMethods: () => PaymentMethodId[]
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethodsSettings = {
  pix: {
    enabled: true,
    label: 'PIX',
    subtitle: 'Aprovacao imediata',
  },
  credit: {
    enabled: true,
    label: 'Cartao de credito',
    subtitle: 'Ate 12x sem juros',
  },
  boleto: {
    enabled: false,
    label: 'Boleto',
    subtitle: 'Aprovacao em 1 dia util',
  },
  defaultMethod: 'pix',
}

const ORDER: PaymentMethodId[] = ['pix', 'credit', 'boleto']

export const usePaymentMethodsStore = create<PaymentMethodsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PAYMENT_METHODS,

      update: (patch) => set((state) => ({ ...state, ...patch })),

      toggle: (method, enabled) =>
        set((state) => ({
          ...state,
          [method]: { ...state[method], enabled },
        })),

      setSubtitle: (method, subtitle) =>
        set((state) => ({
          ...state,
          [method]: { ...state[method], subtitle },
        })),

      setLabel: (method, label) =>
        set((state) => ({
          ...state,
          [method]: { ...state[method], label },
        })),

      setDefaultMethod: (method) => set({ defaultMethod: method }),

      reset: () => set({ ...DEFAULT_PAYMENT_METHODS }),

      getEnabledMethods: () => {
        const state = get()
        return ORDER.filter((method) => state[method].enabled)
      },
    }),
    {
      name: 'alfaconstrucao-payment-methods',
      version: 1,
    },
  ),
)
