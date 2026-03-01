import { useState } from 'react'
import { usePairing } from '@/contexts/PairingContext'
import { Button, Card, MochiAvatar } from '@/components/ui'
import { InviteCodeDisplay } from '@/components/pairing/InviteCodeDisplay'
import { InviteCodeInput } from '@/components/pairing/InviteCodeInput'
import { WaitingForPartner } from '@/components/pairing/WaitingForPartner'

type PairingScreen = 'choose' | 'generate' | 'enter'

export function PairingFlow() {
  const { generateInviteCode, claimInviteCode } = usePairing()
  const [screen, setScreen] = useState<PairingScreen>('choose')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    const result = await generateInviteCode()
    if (result.success && result.code) {
      setInviteCode(result.code)
      setScreen('generate')
    } else {
      setError(result.error || 'Failed to generate code')
    }
    setGenerating(false)
  }

  async function handleClaim(code: string) {
    setClaiming(true)
    setError('')
    const result = await claimInviteCode(code)
    if (!result.success) {
      setError(result.error || 'Failed to join partner')
    }
    setClaiming(false)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <MochiAvatar size="md" className="motion-safe:animate-[float_3s_ease-in-out_infinite]" />
          <h1 className="font-heading text-2xl font-semibold tracking-[var(--tracking-display)] text-text-primary">
            Find Your Partner
          </h1>
          <p className="text-sm text-text-secondary text-center">
            Jugalbandi is for two. Pair up to start your journey together.
          </p>
        </div>

        {screen === 'choose' && (
          <div className="space-y-3">
            <Card hoverable className="cursor-pointer" onClick={handleGenerate}>
              <div className="text-center space-y-1">
                <p className="font-heading text-lg font-semibold text-text-primary">
                  {generating ? 'Generating...' : 'Create Invite'}
                </p>
                <p className="text-sm text-text-secondary">
                  Generate a code for your partner to enter
                </p>
              </div>
            </Card>
            <Card hoverable className="cursor-pointer" onClick={() => setScreen('enter')}>
              <div className="text-center space-y-1">
                <p className="font-heading text-lg font-semibold text-text-primary">
                  I Have a Code
                </p>
                <p className="text-sm text-text-secondary">
                  Enter the code your partner shared with you
                </p>
              </div>
            </Card>
            {error && (
              <p className="text-sm text-error text-center">{error}</p>
            )}
          </div>
        )}

        {screen === 'generate' && inviteCode && (
          <div className="space-y-4">
            <InviteCodeDisplay code={inviteCode} />
            <WaitingForPartner />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => { setScreen('choose'); setInviteCode(null) }}
            >
              Back
            </Button>
          </div>
        )}

        {screen === 'enter' && (
          <Card>
            <div className="space-y-4">
              <p className="text-sm text-text-secondary text-center">
                Enter the 6-character code from your partner
              </p>
              <InviteCodeInput
                onSubmit={handleClaim}
                loading={claiming}
                error={error}
              />
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => { setScreen('choose'); setError('') }}
              >
                Back
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
