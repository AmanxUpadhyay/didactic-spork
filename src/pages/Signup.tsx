import { useState, type FormEvent } from 'react'
import { FaApple } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { m } from 'motion/react'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'
import { pageTransitionSpring, kawaiiSpring } from '@/lib/animations/config'
import { haptics } from '@/lib/animations'

interface SignupProps {
  onSignUp: (name: string, email: string, password: string) => Promise<{ error: Error | null; session?: unknown }>
  onSwitchToLogin: () => void
  onGoogleSignIn?: () => Promise<unknown>
  onAppleSignIn?: () => Promise<unknown>
  onForgotPassword?: () => void
}

export function Signup({ onSignUp, onSwitchToLogin, onGoogleSignIn, onAppleSignIn, onForgotPassword }: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    if (password.length < 6) {
      setErrors({ password: 'Must be at least 6 characters' })
      return
    }

    setLoading(true)
    const { error, session } = await onSignUp(name.trim(), email, password)
    if (error) {
      setErrors({ general: error.message })
    } else if (!session) {
      setSent(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    if (!onGoogleSignIn) return
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
    if (!onAppleSignIn) return
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
        <div className="flex flex-col items-center gap-1">
          <MochiAvatar
            size="2xl"
            expression={sent ? 'sparkle' : 'curious'}
            className="-mb-8 motion-safe:animate-[float_3s_ease-in-out_infinite]"
          />
          <h1 className="font-heading text-3xl font-extrabold tracking-[var(--tracking-display)] text-text-primary">
            Jugalbandi
          </h1>
          <p className="text-sm text-text-secondary">Start your first sprint</p>
        </div>

        {sent ? (
          <Card>
            <div className="text-center space-y-3 py-2">
              <p className="font-medium text-text-primary">Check your inbox!</p>
              <p className="text-sm text-text-secondary">
                We sent a confirmation link to{' '}
                <span className="text-primary font-medium">{email}</span>.
                Click it to activate your account.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {(onGoogleSignIn || onAppleSignIn) && (
              <div className="space-y-3">
                {onGoogleSignIn && (
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
                )}

                {false && onAppleSignIn && (
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

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-text-tertiary">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              </div>
            )}

            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  error={errors.name}
                  required
                />
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
                  autoComplete="new-password"
                  error={errors.password}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  error={errors.confirmPassword || errors.general}
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </Card>
          </>
        )}

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </m.div>
    </div>
  )
}
