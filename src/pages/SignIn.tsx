import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/useAuthStore'

export function SignInPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (login(username, password)) {
      navigate('/app/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-bg px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="ALumiEye" className="h-14 w-14 rounded-full object-cover" />
          <h1 className="mt-4 text-2xl font-semibold text-text-primary">ALumiEye</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alex"
              className="mt-1"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/sign-up" className="font-medium text-brand-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
