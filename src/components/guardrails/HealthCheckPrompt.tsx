import { useState } from 'react'
import { BottomSheet, Button } from '@/components/ui'
import { useKira } from '@/hooks/useKira'

interface HealthSignal {
  id: string
  signal_type: string
  severity: number
}

interface HealthCheckPromptProps {
  signals: HealthSignal[]
  isCritical: boolean
  onDismiss: () => void
}

export function HealthCheckPrompt({ signals, isCritical, onDismiss }: HealthCheckPromptProps) {
  const { invoke, loading } = useKira()
  const [kiraResponse, setKiraResponse] = useState<string | null>(null)
  const [open, setOpen] = useState(true)

  const handleAction = async (action: 'cooperative' | 'grace' | 'fine') => {
    const result = await invoke('health_check_response', {
      action,
      signal_id: signals[0]?.id,
      signal_type: signals[0]?.signal_type,
    })

    if (result?.data) {
      setKiraResponse((result.data as { response?: string }).response || null)
    }

    // Auto-close after a moment for 'fine'
    if (action === 'fine') {
      setTimeout(() => {
        setOpen(false)
        onDismiss()
      }, 2000)
    }
  }

  return (
    <BottomSheet open={open} onClose={() => { setOpen(false); onDismiss() }}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isCritical ? '💛' : '💙'}</span>
          <div>
            <h3 className="font-semibold text-text-primary">Kira wants to check in</h3>
            <p className="text-xs text-text-secondary">
              {signals.length} pattern{signals.length !== 1 ? 's' : ''} noticed
            </p>
          </div>
        </div>

        {kiraResponse ? (
          <p className="text-sm text-text-primary bg-surface-secondary rounded-xl p-3">
            {kiraResponse}
          </p>
        ) : (
          <>
            <p className="text-sm text-text-secondary">
              {isCritical
                ? "Hey — some things have been piling up. No pressure, but it might be worth adjusting how you play."
                : "I've noticed a few patterns this week. Want to shake things up?"}
            </p>

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => handleAction('cooperative')}
                disabled={loading}
              >
                Switch to Cooperative Mode
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => handleAction('grace')}
                disabled={loading}
              >
                Take a Grace Week
              </Button>
              <Button
                variant="ghost"
                className="w-full text-text-secondary"
                onClick={() => handleAction('fine')}
                disabled={loading}
              >
                We're doing fine
              </Button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
