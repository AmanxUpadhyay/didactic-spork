import { useState, type FormEvent } from 'react'
import { FaApple } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { m } from 'motion/react'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'
import { pageTransitionSpring, kawaiiSpring } from '@/lib/animations/config'
import { haptics } from '@/lib/animations'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ error: Error | null }>
  onGoogleSignIn: () => Promise<unknown>
  onAppleSignIn: () => Promise<unknown>
  onSwitchToSignup?: () => void
  onForgotPassword?: () => void
}

export function Login({ onLogin, onGoogleSignIn, onAppleSignIn, onSwitchToSignup, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    const { error } = await onLogin(email, password)
    if (error) setErrors({ general: error.message })
    setLoading(false)
  }

  async function handleGoogle() {
    setErrors({})
    setOauthLoading('google')
    haptics.light()
    try {
      const { error } = (await onGoogleSignIn()) as { error: Error | null }
      if (error) setErrors({ general: error.message })
    } catch {
      setErrors({ general: 'Google sign-in failed. Please try again.' })
    } finally {
      setOauthLoading(null)
    }
  }

  async function handleApple() {
    setErrors({})
    setOauthLoading('apple')
    haptics.light()
    try {
      const { error } = (await onAppleSignIn()) as { error: Error | null }
      if (error) setErrors({ general: error.message })
    } catch {
      setErrors({ general: 'Apple sign-in failed. Please try again.' })
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <m.div
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransitionSpring}
      >
        {/* Logo / mascot */}
        <div className="flex flex-col items-center gap-3">
          <MochiAvatar size="lg" expression="idle" className="motion-safe:animate-[float_3s_ease-in-out_infinite]" />
          <h1 className="font-heading text-3xl font-extrabold tracking-[var(--tracking-display)] text-text-primary">
            Jugalbandi
          </h1>
          <p className="text-sm text-text-secondary">Sign in to start your sprint</p>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <m.button
            type="button"
            onClick={handleGoogle}
            disabled={!!oauthLoading || loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            transition={kawaiiSpring}
            onPointerDown={() => haptics.light()}
            className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] min-h-[44px] border border-border bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm disabled:opacity-50"
          >
            <FcGoogle size={18} aria-hidden="true" />
            {oauthLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </m.button>

          {false && (
          <m.button
            type="button"
            onClick={handleApple}
            disabled={!!oauthLoading || loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            transition={kawaiiSpring}
            onPointerDown={() => haptics.light()}
            className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] min-h-[44px] bg-black px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            <FaApple size={20} aria-hidden="true" />
            {oauthLoading === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
          </m.button>
          )}

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
              error={errors.email}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              error={errors.password || errors.general}
              required
            />
            {onForgotPassword && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-text-secondary hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
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
      </m.div>
    </div>
  )
}
