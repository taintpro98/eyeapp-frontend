import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

/** Refreshes tokens on app load when we have a persisted refresh token */
export function AuthInit() {
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const tryRefresh = useAuthStore((s) => s.tryRefresh)

  useEffect(() => {
    if (refreshToken) {
      tryRefresh()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  return null
}
