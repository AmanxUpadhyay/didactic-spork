import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Input, Card, MochiAvatar } from '@/components/ui'

interface OAuthProfileSetupProps {
  userId: string
  email: string
  onComplete: () => Promise<void>
}

export function OAuthProfileSetup({ userId, email, onComplete }: OAuthProfileSetupProps) {
  // Pre-fill from Google/Apple user_metadata or fall back to email prefix
  const [name, setName] = useState(() => {
    // user_metadata isn't available here, so we derive from email
    return (email.split('@')[0] ?? '').replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const { error: upsertErr } = await supabase.from('users').upsert({
        id: userId,
        name: trimmed,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        avatar_url: null,
        preferences: {},
        hard_nos: [],
        mild_discomforts: [],
      })
      if (upsertErr) throw upsertErr
      await onComplete()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <MochiAvatar size="lg" className="motion-safe:animate-[float_3s_ease-in-out_infinite]" />
          <h1 className="font-heading text-2xl font-semibold tracking-[var(--tracking-display)] text-text-primary">
            One last thing
          </h1>
          <p className="text-center text-sm text-text-secondary">
            What should your partner call you?
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
              error={error}
              required
            />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Setting up…' : 'Continue'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-text-tertiary">
          Signed in as {email}
        </p>
      </div>
    </div>
  )
}
