import { useState, type FormEvent } from 'react'
import { m } from 'motion/react'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import { pageTransitionSpring } from '@/lib/animations/config'
import { supabase } from '@/lib/supabase'

interface PasswordResetScreenProps {
  onComplete: () => void
  onCancel?: () => void
}

export function PasswordResetScreen({ onComplete, onCancel }: PasswordResetScreenProps) {
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    toast('Password updated!', 'success')
    setLoading(false)
    onComplete()
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
            expression="celebrate"
            className="-mb-8 motion-safe:animate-[float_3s_ease-in-out_infinite]"
          />
          <h1 className="font-heading text-3xl font-extrabold tracking-[var(--tracking-display)] text-text-primary">
            Jugalbandi
          </h1>
          <p className="text-sm text-text-secondary">Set your new password</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              error={error}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </Card>

        {onCancel && (
          <p className="text-center text-sm text-text-secondary">
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut()
                onCancel()
              }}
              className="text-primary font-semibold hover:underline"
            >
              ← Back to sign in
            </button>
          </p>
        )}
      </m.div>
    </div>
  )
}
