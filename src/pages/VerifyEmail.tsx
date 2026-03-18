import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { verifyEmail } from '@/api/auth'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

// Dedupe: only one in-flight request per token (fixes React Strict Mode double-mount)
const inFlight = new Map<string, Promise<void>>()
// If first request succeeds and second fails (token consumed), prefer success
const verifiedTokens = new Set<string>()

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Verification link is invalid or missing.')
      return
    }

    setStatus('loading')

    let promise = inFlight.get(token)
    if (!promise) {
      promise = verifyEmail(token)
        .then(() => {
          verifiedTokens.add(token)
          inFlight.delete(token)
        })
        .catch((err) => {
          inFlight.delete(token)
          throw err
        })
      inFlight.set(token, promise)
    }

    promise
      .then(() => {
        if (mountedRef.current) setStatus('success')
      })
      .catch((err: Error & { code?: string }) => {
        if (!mountedRef.current) return
        if (verifiedTokens.has(token)) {
          setStatus('success')
          return
        }
        setStatus('error')
        if (err.code === 'verification_token_expired') {
          setError('This verification link has expired. Please request a new one.')
        } else {
          setError(err.message || 'Verification failed. The link may be invalid or already used.')
        }
      })
  }, [token])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-bg px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="ALumiEye" className="h-14 w-14 rounded-full object-cover" />
          <h1 className="mt-4 text-2xl font-semibold text-text-primary">ALumiEye</h1>
          <p className="mt-1 text-sm text-text-secondary">Email verification</p>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-lg border border-surface-border bg-surface-card p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
              <p className="text-center text-sm text-text-secondary">
                Verifying your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <p className="text-center text-sm text-text-primary">
                Your email has been verified successfully. You can now sign in to your account.
              </p>
              <Button asChild className="w-full">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600" />
              <p className="text-center text-sm text-red-600">{error}</p>
              <div className="flex w-full flex-col gap-2">
                <Button asChild variant="default" className="w-full">
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/sign-up">Create account</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
