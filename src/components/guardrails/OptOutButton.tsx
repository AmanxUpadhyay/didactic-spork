import { useState } from 'react'
import { Button } from '@/components/ui'

interface OptOutButtonProps {
  feature: string
  label: string
  onOptOut: (feature: string) => void
}

export function OptOutButton({ feature, label, onOptOut }: OptOutButtonProps) {
  const [confirmed, setConfirmed] = useState(false)

  if (confirmed) {
    return (
      <p className="text-xs text-text-secondary text-center py-2">
        Got it! You can re-enable this anytime in Settings.
      </p>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full text-text-secondary"
      onClick={() => {
        setConfirmed(true)
        onOptOut(feature)
      }}
    >
      {label}
    </Button>
  )
}
