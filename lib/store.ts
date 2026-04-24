import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from './types'

const ADMIN_SESSION_COOKIE = 'alfa-admin-session'

const DEMO_USERS: Record<string, { passwordHash: string; user: User }> = {
  'admin@alfaconstrucao.com': {
    passwordHash: process.env.NEXT_PUBLIC_ADMIN_PW_HASH ?? '',
    user: {
      id: '1',
      email: 'admin@alfaconstrucao.com',
      name: 'Admin User',
      role: 'admin',
    },
  },
  'superadmin@alfaconstrucao.com': {
    passwordHash: process.env.NEXT_PUBLIC_SUPERADMIN_PW_HASH ?? '',
    user: {
      id: '2',
      email: 'superadmin@alfaconstrucao.com',
      name: 'SuperAdmin User',
      role: 'superadmin',
    },
  },
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const demoUser = DEMO_USERS[email]
        if (demoUser && demoUser.passwordHash) {
          const inputHash = await hashPassword(password)
          if (inputHash === demoUser.passwordHash) {
            set({ user: demoUser.user, isAuthenticated: true })
            document.cookie = `${ADMIN_SESSION_COOKIE}=1; path=/; SameSite=Strict`
            return { success: true }
          }
        }
        return { success: false, error: 'Credenciais invalidas' }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
        document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Strict`
      },
    }),
    {
      name: 'alfaconstrucao-auth',
    }
  )
)
