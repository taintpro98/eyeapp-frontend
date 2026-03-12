import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/useAuthStore'

export function SignUpPage() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 3) {
      setError('Password must be at least 3 characters')
      return
    }
    if (signUp(username, password, displayName || username)) {
      navigate('/app/dashboard')
    } else {
      setError('Username already taken')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-bg px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="ALumiEye" className="h-14 w-14 rounded-full object-cover" />
          <h1 className="mt-4 text-2xl font-semibold text-text-primary">ALumiEye</h1>
          <p className="mt-1 text-sm text-text-secondary">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="mt-1"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Display name</label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
              autoComplete="name"
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
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Confirm password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              autoComplete="new-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/sign-in" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
