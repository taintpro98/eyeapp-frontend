import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  user: { username: string; displayName: string } | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  signUp: (username: string, password: string, displayName: string) => boolean
}

const MOCK_USERS: Record<string, { password: string; displayName: string }> = {
  alex: { password: '123', displayName: 'Alex Trader' },
}

export const useAuthStore = create<AuthState>()(
    persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (username: string, password: string) => {
        const stored = MOCK_USERS[username.toLowerCase()]
        if (stored && stored.password === password) {
          set({
            user: { username: username.toLowerCase(), displayName: stored.displayName },
            isAuthenticated: true,
          })
          return true
        }
        return false
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      signUp: (username: string, password: string, displayName: string) => {
        const key = username.toLowerCase()
        if (!MOCK_USERS[key]) {
          MOCK_USERS[key] = { password, displayName }
          set({
            user: { username: key, displayName },
            isAuthenticated: true,
          })
          return true
        }
        return false
      },
    }),
    {
      name: 'alumieye-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)
