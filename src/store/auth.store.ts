import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Tenant } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  tenant: Tenant | null
  setAuth: (token: string, user: User) => void
  setTenant: (tenant: Tenant) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      tenant: null,

      setAuth: (token, user) => {
        localStorage.setItem('kimsha_token', token)
        set({ token, user })
      },

      setTenant: (tenant) => set({ tenant }),

      logout: () => {
        localStorage.removeItem('kimsha_token')
        set({ token: null, user: null, tenant: null })
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'kimsha_auth',
      partialize: (s) => ({ token: s.token, user: s.user, tenant: s.tenant }),
    }
  )
)
