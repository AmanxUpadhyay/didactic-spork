import { useState, type FormEvent } from 'react'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ error: Error | null }>
  onSwitchToSignup?: () => void
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await onLogin(email, password)
    if (error) setError(error.message)
    setLoading(false)
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
            <Button type="submit" className="w-full" disabled={loading}>
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
