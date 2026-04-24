import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CityContact {
  id: string
  label: string
  number: string
  active: boolean
}

export interface CityPage {
  id: string
  slug: string
  cityName: string
  state: string
  active: boolean
  headline: string
  subheadline: string
  offerBadge: string
  defaultMessage: string
  rotationIntervalMinutes: number
  contacts: CityContact[]
  createdAt: number
}

export interface CityPageInput {
  slug?: string
  cityName: string
  state: string
  active?: boolean
  headline?: string
  subheadline?: string
  offerBadge?: string
  defaultMessage?: string
  rotationIntervalMinutes?: number
  contacts?: Omit<CityContact, 'id'>[]
}

interface CitiesState {
  cities: CityPage[]
  addCity: (input: CityPageInput) => CityPage
  updateCity: (id: string, updates: Partial<Omit<CityPage, 'id' | 'createdAt'>>) => void
  removeCity: (id: string) => void
  addContact: (cityId: string, contact: Omit<CityContact, 'id'>) => void
  updateContact: (cityId: string, contactId: string, updates: Partial<Omit<CityContact, 'id'>>) => void
  removeContact: (cityId: string, contactId: string) => void
  getCityBySlug: (slug: string) => CityPage | undefined
  getContactForCity: (slug: string) => CityContact | null
}

const sanitizeNumber = (value: string) => value.replace(/\D/g, '')

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const INITIAL_CITIES: CityPage[] = []

export const useCitiesStore = create<CitiesState>()(
  persist(
    (set, get) => ({
      cities: INITIAL_CITIES,

      addCity: (input) => {
        const baseSlug = slugify(input.slug || input.cityName)
        const existing = new Set(get().cities.map((c) => c.slug))
        let finalSlug = baseSlug
        let counter = 2
        while (existing.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter}`
          counter += 1
        }
        const id = `city-${Date.now()}`
        const city: CityPage = {
          id,
          slug: finalSlug,
          cityName: input.cityName.trim(),
          state: (input.state || 'SP').toUpperCase(),
          active: input.active ?? true,
          headline:
            input.headline?.trim() ||
            `Material de construcao em ${input.cityName.trim()} com entrega rapida`,
          subheadline:
            input.subheadline?.trim() ||
            `Cimento, argamassa e rejunte com descontos para ${input.cityName.trim()}. Frete reduzido e atendimento pelo WhatsApp.`,
          offerBadge: input.offerBadge?.trim() || `Oferta especial para ${input.cityName.trim()}`,
          defaultMessage:
            input.defaultMessage?.trim() ||
            `Ola! Cheguei pela campanha de ${input.cityName.trim()} e quero um orcamento.`,
          rotationIntervalMinutes: Math.max(1, Math.floor(input.rotationIntervalMinutes || 15)),
          contacts: (input.contacts || []).map((contact, index) => ({
            ...contact,
            id: `${id}-c${index + 1}`,
            number: sanitizeNumber(contact.number),
          })),
          createdAt: Date.now(),
        }
        set((state) => ({ cities: [...state.cities, city] }))
        return city
      },

      updateCity: (id, updates) =>
        set((state) => ({
          cities: state.cities.map((city) => {
            if (city.id !== id) return city
            const next: CityPage = { ...city, ...updates }
            if (updates.slug !== undefined) {
              next.slug = slugify(updates.slug) || city.slug
            }
            if (updates.state !== undefined) {
              next.state = updates.state.toUpperCase()
            }
            if (updates.rotationIntervalMinutes !== undefined) {
              next.rotationIntervalMinutes = Math.max(
                1,
                Math.floor(updates.rotationIntervalMinutes || 1),
              )
            }
            return next
          }),
        })),

      removeCity: (id) =>
        set((state) => ({ cities: state.cities.filter((city) => city.id !== id) })),

      addContact: (cityId, contact) =>
        set((state) => ({
          cities: state.cities.map((city) =>
            city.id !== cityId
              ? city
              : {
                  ...city,
                  contacts: [
                    ...city.contacts,
                    {
                      ...contact,
                      id: `${cityId}-c${Date.now()}`,
                      number: sanitizeNumber(contact.number),
                    },
                  ],
                },
          ),
        })),

      updateContact: (cityId, contactId, updates) =>
        set((state) => ({
          cities: state.cities.map((city) =>
            city.id !== cityId
              ? city
              : {
                  ...city,
                  contacts: city.contacts.map((contact) =>
                    contact.id !== contactId
                      ? contact
                      : {
                          ...contact,
                          ...updates,
                          number: updates.number
                            ? sanitizeNumber(updates.number)
                            : contact.number,
                        },
                  ),
                },
          ),
        })),

      removeContact: (cityId, contactId) =>
        set((state) => ({
          cities: state.cities.map((city) =>
            city.id !== cityId
              ? city
              : { ...city, contacts: city.contacts.filter((c) => c.id !== contactId) },
          ),
        })),

      getCityBySlug: (slug) => get().cities.find((city) => city.slug === slug),

      getContactForCity: (slug) => {
        const city = get().cities.find((c) => c.slug === slug)
        if (!city || !city.active) return null
        const activeContacts = city.contacts.filter((c) => c.active && c.number)
        if (activeContacts.length === 0) return null
        const windowMs = Math.max(1, city.rotationIntervalMinutes) * 60 * 1000
        const currentWindow = Math.floor(Date.now() / windowMs)
        return activeContacts[currentWindow % activeContacts.length]
      },
    }),
    {
      name: 'alfaconstrucao-cities',
      version: 2,
      migrate: (persisted) => {
        const state = { ...(persisted || {}) } as { cities?: CityPage[] }
        if (Array.isArray(state.cities)) {
          state.cities = state.cities
            .map((city) => ({
              ...city,
              contacts: (city.contacts || []).filter((c) => {
                if (!c || !c.number) return false
                const digits = c.number.replace(/\D/g, '')
                return digits.length >= 10 && digits !== '551145724545'
              }),
            }))
            .filter((city) => city.id !== 'city-seed-sao-paulo')
        }
        return state as { cities: CityPage[] }
      },
    },
  ),
)
