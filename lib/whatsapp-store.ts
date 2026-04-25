import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WhatsAppContact {
  id: string
  label: string
  number: string
  active: boolean
}

interface WhatsAppState {
  contacts: WhatsAppContact[]
  defaultMessage: string
  rotationIntervalMinutes: number
  /** Quantos cliques sao necessarios antes de rotacionar para o proximo contato. Default 10. */
  clicksPerRotation: number
  /** Contador acumulado de cliques no botao do WhatsApp (persistido por dispositivo). */
  clickCount: number
  addContact: (contact: Omit<WhatsAppContact, 'id'>) => void
  updateContact: (id: string, updates: Partial<Omit<WhatsAppContact, 'id'>>) => void
  removeContact: (id: string) => void
  setDefaultMessage: (message: string) => void
  setRotationIntervalMinutes: (minutes: number) => void
  setClicksPerRotation: (clicks: number) => void
  /** Retorna o contato ativo correspondente a janela de tempo atual (para exibicao). */
  getContactForCurrentWindow: () => WhatsAppContact | null
  /** Retorna o contato ativo correspondente ao bloco atual de cliques (para exibicao, nao incrementa). */
  getContactForCurrentClickBlock: () => WhatsAppContact | null
  /** Incrementa o contador e retorna o contato ativo correspondente ao novo bloco (chamar no onClick). */
  registerClickAndGetContact: () => WhatsAppContact | null
}

const SEED_PHANTOM_NUMBERS = new Set(['551145724545'])

const sanitizeNumber = (value: string) => value.replace(/\D/g, '')

const getActiveContacts = (state: Pick<WhatsAppState, 'contacts'>): WhatsAppContact[] =>
  state.contacts.filter(
    (contact) => contact.active && contact.number.replace(/\D/g, '').length >= 10,
  )

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      contacts: [],
      defaultMessage: 'Ola AlfaConstrução, estou navegando no site e gostaria de ajuda!',
      rotationIntervalMinutes: 15,
      clicksPerRotation: 10,
      clickCount: 0,

      addContact: (contact) =>
        set((state) => ({
          contacts: [
            ...state.contacts,
            {
              ...contact,
              id: `wpp-${Date.now()}`,
              number: sanitizeNumber(contact.number),
            },
          ],
        })),

      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id
              ? {
                  ...contact,
                  ...updates,
                  number: updates.number ? sanitizeNumber(updates.number) : contact.number,
                }
              : contact,
          ),
        })),

      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        })),

      setDefaultMessage: (message) => set({ defaultMessage: message }),
      setRotationIntervalMinutes: (minutes) =>
        set({ rotationIntervalMinutes: Math.max(1, Math.floor(minutes || 1)) }),
      setClicksPerRotation: (clicks) =>
        set({ clicksPerRotation: Math.max(1, Math.floor(clicks || 1)) }),

      getContactForCurrentWindow: () => {
        const state = get()
        const activeContacts = getActiveContacts(state)
        if (activeContacts.length === 0) return null
        const rotationWindowMs = Math.max(1, state.rotationIntervalMinutes) * 60 * 1000
        const currentWindow = Math.floor(Date.now() / rotationWindowMs)
        const index = currentWindow % activeContacts.length
        return activeContacts[index]
      },

      getContactForCurrentClickBlock: () => {
        const state = get()
        const activeContacts = getActiveContacts(state)
        if (activeContacts.length === 0) return null
        const blockSize = Math.max(1, state.clicksPerRotation)
        const blockIndex = Math.floor(state.clickCount / blockSize) % activeContacts.length
        return activeContacts[blockIndex]
      },

      registerClickAndGetContact: () => {
        const state = get()
        const activeContacts = getActiveContacts(state)
        if (activeContacts.length === 0) return null
        const blockSize = Math.max(1, state.clicksPerRotation)
        const newCount = state.clickCount + 1
        // O bloco corresponde aos cliques 1-N do primeiro contato, N+1 a 2N do segundo, etc.
        // Usamos (newCount - 1) para que o primeiro clique caia no bloco 0 (primeiro contato).
        const blockIndex = Math.floor((newCount - 1) / blockSize) % activeContacts.length
        set({ clickCount: newCount })
        return activeContacts[blockIndex]
      },
    }),
    {
      name: 'alfaconstrucao-whatsapp',
      version: 3,
      migrate: (persisted, version) => {
        const state = { ...(persisted || {}) } as Partial<WhatsAppState>
        if (Array.isArray(state.contacts)) {
          state.contacts = state.contacts.filter((contact) => {
            if (!contact || !contact.number) return false
            const digits = contact.number.replace(/\D/g, '')
            if (digits.length < 10) return false
            if (SEED_PHANTOM_NUMBERS.has(digits)) return false
            return true
          })
        }
        if (version < 3) {
          state.clicksPerRotation = state.clicksPerRotation ?? 10
          state.clickCount = state.clickCount ?? 0
        }
        return state as WhatsAppState
      },
    },
  ),
)
