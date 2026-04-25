import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
export type PixGatewayProvider = 'none' | 'koliseu'

export interface PixSettings {
  enabled: boolean
  pixKey: string
  pixKeyType: PixKeyType
  beneficiaryName: string
  beneficiaryCity: string
  bankName: string
  discountPercent: number
  expirationMinutes: number
  instructions: string
  customQrUrl: string
  staticPayload: string
  showOnCheckout: boolean
  whatsappConfirmEnabled: boolean
  gatewayProvider: PixGatewayProvider
  gatewayEnabled: boolean
  gatewayApiKey: string
  gatewayBaseUrl: string
  gatewayHasServerKey: boolean
}

export type ManualPixStatus = 'pending' | 'paid' | 'expired' | 'cancelled'

export interface ManualPixCharge {
  id: string
  createdAt: string
  amount: number
  description: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerDocument?: string
  txid: string
  payload: string
  status: ManualPixStatus
  paidAt?: string
  notes?: string
  orderId?: string
  gatewayProvider?: PixGatewayProvider
  gatewayPaymentId?: string
  gatewayQrImage?: string
  gatewayStatus?: string
  gatewayRaw?: unknown
}

interface PixState extends PixSettings {
  charges: ManualPixCharge[]
  update: (patch: Partial<PixSettings>) => void
  addCharge: (
    charge: Omit<ManualPixCharge, 'id' | 'createdAt' | 'status'> & {
      status?: ManualPixStatus
    },
  ) => ManualPixCharge
  updateCharge: (id: string, patch: Partial<ManualPixCharge>) => void
  removeCharge: (id: string) => void
  markPaid: (id: string) => void
  markCancelled: (id: string) => void
  reset: () => void
}

export const DEFAULT_PIX: PixSettings = {
  enabled: true,
  pixKey: '',
  pixKeyType: 'cnpj',
  beneficiaryName: 'ALFACONSTRUCAO',
  beneficiaryCity: 'SAO PAULO',
  bankName: '',
  discountPercent: 5,
  expirationMinutes: 30,
  instructions:
    'Apos o pagamento, envie o comprovante pelo WhatsApp para agilizar a liberacao do seu pedido.',
  customQrUrl: '',
  staticPayload: '',
  showOnCheckout: true,
  whatsappConfirmEnabled: true,
  gatewayProvider: 'koliseu',
  gatewayEnabled: true,
  gatewayApiKey: '',
  gatewayBaseUrl: 'https://www.koliseu.cloud/api/v1',
  gatewayHasServerKey: true,
}

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `pix_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export const usePixStore = create<PixState>()(
  persist(
    (set) => ({
      ...DEFAULT_PIX,
      charges: [],
      update: (patch) => set((state) => ({ ...state, ...patch })),
      addCharge: (input) => {
        const charge: ManualPixCharge = {
          id: newId(),
          createdAt: new Date().toISOString(),
          status: input.status ?? 'pending',
          amount: input.amount,
          description: input.description,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          customerDocument: input.customerDocument,
          txid: input.txid,
          payload: input.payload,
          paidAt: input.paidAt,
          notes: input.notes,
          orderId: input.orderId,
          gatewayProvider: input.gatewayProvider,
          gatewayPaymentId: input.gatewayPaymentId,
          gatewayQrImage: input.gatewayQrImage,
          gatewayStatus: input.gatewayStatus,
          gatewayRaw: input.gatewayRaw,
        }
        set((state) => ({ charges: [charge, ...state.charges] }))
        return charge
      },
      updateCharge: (id, patch) =>
        set((state) => ({
          charges: state.charges.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCharge: (id) =>
        set((state) => ({
          charges: state.charges.filter((c) => c.id !== id),
        })),
      markPaid: (id) =>
        set((state) => ({
          charges: state.charges.map((c) =>
            c.id === id ? { ...c, status: 'paid', paidAt: new Date().toISOString() } : c,
          ),
        })),
      markCancelled: (id) =>
        set((state) => ({
          charges: state.charges.map((c) =>
            c.id === id ? { ...c, status: 'cancelled' } : c,
          ),
        })),
      reset: () =>
        set((state) => ({ ...state, ...DEFAULT_PIX, charges: state.charges })),
    }),
    {
      name: 'alfaconstrucao-pix',
      version: 1,
    },
  ),
)
