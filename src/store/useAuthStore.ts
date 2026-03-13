import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/api/auth'
import * as authApi from '@/api/auth'

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>
  loginWithSocial: (provider: 'google' | 'facebook', data: { email: string; name: string }) => void
  setTokens: (accessToken: string, refreshToken: string, user: User) => void
  clearAuth: () => void
  clearError: () => void
  tryRefresh: () => Promise<boolean>
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.login({ email, password })
          set({
            user: res.user,
            accessToken: res.tokens.access_token,
            refreshToken: res.tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed'
          set({ isLoading: false, error: message, isAuthenticated: false })
          return false
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          await authApi.logout(refreshToken ?? undefined)
        } catch {
          // Ignore logout API errors (e.g. already logged out)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await authApi.register({ email, password, display_name: displayName })
          set({
            user: res.user,
            accessToken: res.tokens.access_token,
            refreshToken: res.tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return true
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Registration failed'
          set({ isLoading: false, error: message, isAuthenticated: false })
          return false
        }
      },

      loginWithSocial: (provider, data) => {
        const username = data.email?.split('@')[0] || data.name?.replace(/\s/g, '').toLowerCase() || provider
        set({
          user: {
            id: '',
            email: data.email ?? '',
            display_name: data.name || data.email || username,
            role: 'user',
            status: 'active',
          },
          isAuthenticated: true,
          accessToken: 'social-placeholder',
          refreshToken: null,
        })
      },

      setTokens: (accessToken, refreshToken, user) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      clearError: () => set({ error: null }),


      tryRefresh: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const res = await authApi.refresh(refreshToken)
          set({
            user: res.user,
            accessToken: res.tokens.access_token,
            refreshToken: res.tokens.refresh_token,
            isAuthenticated: true,
          })
          return true
        } catch {
          get().clearAuth()
          return false
        }
      },

      getAccessToken: () => get().accessToken,
    }),
    {
      name: 'alumieye-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
