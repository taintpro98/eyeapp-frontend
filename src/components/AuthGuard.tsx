import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

type AuthGuardProps = {
  children: React.ReactNode
}

/** Redirects to dashboard if user is already authenticated (for sign-in/sign-up pages) */
export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
