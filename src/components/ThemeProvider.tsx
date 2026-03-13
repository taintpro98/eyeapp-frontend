import { useEffect } from 'react'
import { useThemeStore } from '@/store/useThemeStore'

/** Syncs theme from store to document (handles rehydration) */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <>{children}</>
}
