import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ActiveCityState {
  slug: string | null
  cityName: string | null
  state: string | null
  setActiveCity: (slug: string, cityName: string, state?: string) => void
  clearActiveCity: () => void
}

export const useActiveCityStore = create<ActiveCityState>()(
  persist(
    (set) => ({
      slug: null,
      cityName: null,
      state: null,
      setActiveCity: (slug, cityName, state) =>
        set({ slug, cityName, state: state ?? null }),
      clearActiveCity: () => set({ slug: null, cityName: null, state: null }),
    }),
    {
      name: 'active-city-storage',
      version: 1,
    },
  ),
)
