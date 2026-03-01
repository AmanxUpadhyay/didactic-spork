import { useState, type FormEvent } from 'react'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ error: Error | null }>
  onGoogleSignIn: () => Promise<unknown>
  onAppleSignIn: () => Promise<unknown>
  onSwitchToSignup?: () => void
}

export function Login({ onLogin, onGoogleSignIn, onAppleSignIn, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await onLogin(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleGoogle() {
    setError('')
    setOauthLoading('google')
    try {
      const { error } = (await onGoogleSignIn()) as { error: Error | null }
      if (error) setError(error.message)
    } catch {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setOauthLoading(null)
    }
  }

  async function handleApple() {
    setError('')
    setOauthLoading('apple')
    try {
      const { error } = (await onAppleSignIn()) as { error: Error | null }
      if (error) setError(error.message)
    } catch {
      setError('Apple sign-in failed. Please try again.')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / mascot */}
        <div className="flex flex-col items-center gap-3">
          <MochiAvatar size="lg" className="motion-safe:animate-[float_3s_ease-in-out_infinite]" />
          <h1 className="font-heading text-3xl font-semibold tracking-[var(--tracking-display)] text-text-primary">
            Jugalbandi
          </h1>
          <p className="text-sm text-text-secondary">Sign in to start your sprint</p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!!oauthLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] min-h-[44px] border border-border bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition-opacity disabled:opacity-50 hover:bg-gray-50 active:scale-[0.98]"
          >
            {/* Google G logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <button
            type="button"
            onClick={handleApple}
            disabled={!!oauthLoading || loading}
            className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] min-h-[44px] bg-black px-4 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-50 hover:bg-neutral-900 active:scale-[0.98]"
          >
            {/* Apple logo */}
            <svg width="16" height="18" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 523.1 0 372.6 0 230.1 0 106.7 51.5 36.4 101.8 10.8c44.9-22.3 95.6-28.3 143.4-28.3 52.4 0 116.8 14.8 163.4 54.2 45.7 38.6 74.7 75.1 74.7 153.9 0 71.7-12.9 105.4-12.9 105.4" />
            </svg>
            {oauthLoading === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-tertiary">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              error={error}
              required
            />
            <Button type="submit" className="w-full" disabled={loading || !!oauthLoading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        {onSwitchToSignup && (
          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary font-semibold hover:underline"
            >
              Create account
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
