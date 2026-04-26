import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pushAnalyticsEvent } from './supabase-analytics'

export type AnalyticsEventType =
  | 'page_view'
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'lead'
  | 'purchase'

export interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  value: number
  meta?: Record<string, string | number | boolean>
  source: string
  medium: string
  campaign: string
  path: string
  sessionId: string
  ts: number
}

export interface AdSpend {
  id: string
  campaign: string
  source: string
  amount: number
  startDate: string
  endDate: string
}

export interface AttributionContext {
  source: string
  medium: string
  campaign: string
}

interface AnalyticsState {
  events: AnalyticsEvent[]
  spends: AdSpend[]
  attribution: AttributionContext
  sessionId: string
  setAttribution: (ctx: Partial<AttributionContext>) => void
  ensureSession: () => void
  trackEvent: (
    type: AnalyticsEventType,
    options?: { value?: number; meta?: AnalyticsEvent['meta']; path?: string },
  ) => void
  addSpend: (spend: Omit<AdSpend, 'id'>) => void
  updateSpend: (id: string, patch: Partial<Omit<AdSpend, 'id'>>) => void
  removeSpend: (id: string) => void
  clearEvents: () => void
}

const DEFAULT_ATTRIBUTION: AttributionContext = {
  source: 'direct',
  medium: 'none',
  campaign: 'none',
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      events: [],
      spends: [],
      attribution: DEFAULT_ATTRIBUTION,
      sessionId: '',

      setAttribution: (ctx) =>
        set((state) => ({
          attribution: {
            source: ctx.source ?? state.attribution.source,
            medium: ctx.medium ?? state.attribution.medium,
            campaign: ctx.campaign ?? state.attribution.campaign,
          },
        })),

      ensureSession: () => {
        const current = get().sessionId
        if (current) return
        set({ sessionId: newId() })
      },

      trackEvent: (type, options) => {
        const state = get()
        const sessionId = state.sessionId || newId()
        if (!state.sessionId) {
          set({ sessionId })
        }

        const event: AnalyticsEvent = {
          id: newId(),
          type,
          value: options?.value ?? 0,
          meta: options?.meta,
          source: state.attribution.source,
          medium: state.attribution.medium,
          campaign: state.attribution.campaign,
          path: options?.path ?? (typeof window !== 'undefined' ? window.location.pathname : '/'),
          sessionId,
          ts: Date.now(),
        }

        set((s) => ({ events: [...s.events, event].slice(-2000) }))

        if (typeof window !== 'undefined') {
          void pushAnalyticsEvent(event)

          // Dispara conversoes do Google Ads
          const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
          if (gtag) {
            // Conversao de COMPRA - quando o pagamento e confirmado
            if (type === 'purchase') {
              gtag('event', 'conversion', {
                send_to: 'AW-18121021838/purchase',
                value: event.value,
                currency: 'BRL',
                transaction_id: event.id,
              })
            }
            // Conversao de CONTATO - quando clica no WhatsApp
            if (type === 'lead') {
              gtag('event', 'conversion', {
                send_to: 'AW-18121021838/contact',
              })
            }
          }
        }
      },

      addSpend: (spend) =>
        set((state) => ({
          spends: [
            ...state.spends,
            {
              ...spend,
              id: newId(),
              amount: Math.max(0, Number(spend.amount) || 0),
            },
          ],
        })),

      updateSpend: (id, patch) =>
        set((state) => ({
          spends: state.spends.map((s) =>
            s.id === id
              ? {
                  ...s,
                  ...patch,
                  amount:
                    patch.amount !== undefined ? Math.max(0, Number(patch.amount) || 0) : s.amount,
                }
              : s,
          ),
        })),

      removeSpend: (id) =>
        set((state) => ({
          spends: state.spends.filter((s) => s.id !== id),
        })),

      clearEvents: () => set({ events: [] }),
    }),
    {
      name: 'alfaconstrucao-analytics',
      version: 1,
    },
  ),
)
