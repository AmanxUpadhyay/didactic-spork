import { useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sword01Icon, Exchange01Icon, RefreshIcon } from '@hugeicons/core-free-icons'
import { Card, ConfirmDialog } from '@/components/ui'
import { useSprintMode } from '@/hooks/useSprintMode'

const MODES: Array<{ key: 'competitive' | 'cooperative' | 'swap'; icon: ReactNode; label: string; desc: string }> = [
  { key: 'competitive', icon: <HugeiconsIcon icon={Sword01Icon} size={20} />, label: 'Competitive', desc: 'Head-to-head scoring. Loser plans a date.' },
  { key: 'cooperative', icon: <HugeiconsIcon icon={Exchange01Icon} size={20} />, label: 'Cooperative', desc: 'Shared goal. Win together or lose together.' },
  { key: 'swap', icon: <HugeiconsIcon icon={RefreshIcon} size={20} />, label: 'Swap', desc: "Try each other's habits for the week." },
]

export function SprintModeSelector() {
  const { mode, switchMode, loading } = useSprintMode()
  const [pendingMode, setPendingMode] = useState<typeof mode | null>(null)
  const [switching, setSwitching] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!pendingMode) return
    setSwitching(true)
    const result = await switchMode(pendingMode)
    if (result.success && result.message) {
      setMessage(result.message)
    }
    setSwitching(false)
    setPendingMode(null)
  }

  return (
    <Card>
      <p className="text-sm font-medium text-text-primary mb-3">Sprint Mode</p>
      <div className="space-y-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
              mode === m.key
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-surface-secondary hover:bg-surface-secondary/80'
            }`}
            onClick={() => m.key !== mode && setPendingMode(m.key)}
            disabled={loading || switching}
          >
            <span className="flex items-center">{m.icon}</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${mode === m.key ? 'text-primary' : 'text-text-primary'}`}>
                {m.label}
                {mode === m.key && <span className="text-xs ml-1">(current)</span>}
              </p>
              <p className="text-xs text-text-secondary">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
      {message && (
        <p className="text-xs text-text-secondary mt-3 bg-surface-secondary rounded-lg p-2">{message}</p>
      )}

      <ConfirmDialog
        open={!!pendingMode}
        title="Switch Sprint Mode?"
        message={`Change to ${MODES.find((m) => m.key === pendingMode)?.label || ''} mode. This takes effect immediately.`}
        confirmLabel={switching ? 'Switching...' : 'Switch'}
        onConfirm={handleConfirm}
        onClose={() => setPendingMode(null)}
      />
    </Card>
  )
}
