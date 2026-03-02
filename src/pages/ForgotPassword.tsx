import { useState, type FormEvent } from 'react'
import { m } from 'motion/react'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'
import { pageTransitionSpring } from '@/lib/animations/config'
import { supabase } from '@/lib/supabase'

interface ForgotPasswordProps {
  onBack: () => void
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
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
          <p className="text-sm text-text-secondary">
            {sent ? 'Check your inbox' : 'Reset your password'}
          </p>
        </div>

        {sent ? (
          <Card>
            <div className="text-center space-y-3 py-2">
              <p className="text-text-primary font-medium">Reset link sent!</p>
              <p className="text-sm text-text-secondary">
                We've sent a reset link to <span className="text-primary font-medium">{email}</span>.
                Check your inbox and follow the link to set a new password.
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                error={error}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </Card>
        )}

        <p className="text-center text-sm text-text-secondary">
          <button
            type="button"
            onClick={onBack}
            className="text-primary font-semibold hover:underline"
          >
            ← Back to sign in
          </button>
        </p>
      </m.div>
    </div>
  )
}
