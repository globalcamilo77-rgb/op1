import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppearanceSettings {
  brandName: string
  brandHighlight: string
  brandSuffix: string
  logoUrl: string
  primaryColor: string
  primaryDarkColor: string
  notificationBarEnabled: boolean
  notificationBarText: string
  featuredEyebrow: string
  featuredTitle: string
  featuredSubtitle: string
  footerCompany: string
  footerCopyright: string
  footerPhone: string
  footerWhatsapp: string
  footerEmail: string
}

interface AppearanceState extends AppearanceSettings {
  update: (patch: Partial<AppearanceSettings>) => void
  reset: () => void
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  brandName: 'Alfa ',
  brandHighlight: 'Construção',
  brandSuffix: ', O Mercado da Construcao',
  logoUrl: '/logo.png',
  primaryColor: '#f26c27',
  primaryDarkColor: '#d85818',
  notificationBarEnabled: true,
  notificationBarText: 'Orcamento rapido pelo WhatsApp | Entrega em toda regiao',
  featuredEyebrow: 'Produtos em destaque',
  featuredTitle: 'Ofertas ativas da AlfaConstrução',
  featuredSubtitle: 'Os melhores precos para a sua obra, com entrega rapida.',
  footerCompany: 'AlfaConstrução',
  footerCopyright:
    '© 2026 | AlfaConstrução - Todos os direitos reservados\ncontato@alfaconstrucao.com.br',
  footerPhone: '',
  footerWhatsapp: '',
  footerEmail: 'contato@alfaconstrucao.com.br',
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULT_APPEARANCE,
      update: (patch) => set((state) => ({ ...state, ...patch })),
      reset: () => set({ ...DEFAULT_APPEARANCE }),
    }),
    {
      name: 'alfaconstrucao-appearance',
      version: 5,
      migrate: (persisted, version) => {
        const state = { ...(persisted || {}) } as Partial<AppearanceSettings>
        if (version < 2 && (!state.logoUrl || state.logoUrl.trim() === '')) {
          state.logoUrl = DEFAULT_APPEARANCE.logoUrl
        }
        if (version < 3) {
          if (state.primaryColor === '#ff9900' || !state.primaryColor) {
            state.primaryColor = DEFAULT_APPEARANCE.primaryColor
          }
          if (state.primaryDarkColor === '#e68900' || !state.primaryDarkColor) {
            state.primaryDarkColor = DEFAULT_APPEARANCE.primaryDarkColor
          }
        }
        if (version < 4) {
          // Limpa telefone do rodape do seed legado
          const phoneDigits = (state.footerPhone || '').replace(/\D/g, '')
          if (phoneDigits.startsWith('0800333')) {
            state.footerPhone = ''
          }
        }
        if (version < 5) {
          // Bump v5: zera o texto da barra e o WhatsApp do rodape para forcar
          // configuracao manual no /adminlr/aparencia, ja que os valores
          // anteriores nao devem mais ser usados.
          state.footerWhatsapp = ''
          state.notificationBarText = DEFAULT_APPEARANCE.notificationBarText
        }
        return state as AppearanceSettings
      },
    },
  ),
)
