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
  addContact: (contact: Omit<WhatsAppContact, 'id'>) => void
  updateContact: (id: string, updates: Partial<Omit<WhatsAppContact, 'id'>>) => void
  removeContact: (id: string) => void
  setDefaultMessage: (message: string) => void
  setRotationIntervalMinutes: (minutes: number) => void
  getContactForCurrentWindow: () => WhatsAppContact | null
}

const SEED_PHANTOM_NUMBERS = new Set(['551145724545'])

const sanitizeNumber = (value: string) => value.replace(/\D/g, '')

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      contacts: [],
      defaultMessage: 'Ola AlfaConstrução, estou navegando no site e gostaria de ajuda!',
      rotationIntervalMinutes: 15,

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
              : contact
          ),
        })),

      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        })),

      setDefaultMessage: (message) => set({ defaultMessage: message }),
      setRotationIntervalMinutes: (minutes) =>
        set({ rotationIntervalMinutes: Math.max(1, Math.floor(minutes || 1)) }),

      getContactForCurrentWindow: () => {
        const state = get()
        const activeContacts = state.contacts.filter(
          (contact) => contact.active && contact.number.replace(/\D/g, '').length >= 10,
        )

        if (activeContacts.length === 0) {
          return null
        }

        const rotationWindowMs = Math.max(1, state.rotationIntervalMinutes) * 60 * 1000
        const currentWindow = Math.floor(Date.now() / rotationWindowMs)
        const index = currentWindow % activeContacts.length

        return activeContacts[index]
      },
    }),
    {
      name: 'alfaconstrucao-whatsapp',
      version: 2,
      migrate: (persisted) => {
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
        return state as WhatsAppState
      },
    }
  )
)
