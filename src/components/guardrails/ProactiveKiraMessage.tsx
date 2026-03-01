import { useState, useEffect } from 'react'
import { Card, Button, MochiAvatar } from '@/components/ui'
import { useKiraResponse } from '@/hooks/useKiraResponse'
import { useAuth } from '@/hooks/useAuth'

export function ProactiveKiraMessage() {
  const { profile } = useAuth()
  const { latest, loading } = useKiraResponse({
    userId: profile?.id,
    functionType: 'nudge',
    limit: 1,
  })
  const [dismissed, setDismissed] = useState(false)
  const [seen, setSeen] = useState<Set<string>>(new Set())

  // Don't show if already seen this response
  useEffect(() => {
    const stored = localStorage.getItem('seen_kira_messages')
    if (stored) setSeen(new Set(JSON.parse(stored)))
  }, [])

  if (loading || !latest || dismissed) return null
  if (seen.has(latest.id)) return null

  const handleDismiss = () => {
    const newSeen = new Set(seen)
    newSeen.add(latest.id)
    setSeen(newSeen)
    localStorage.setItem('seen_kira_messages', JSON.stringify([...newSeen]))
    setDismissed(true)
  }

  const rawMessage = latest.structured_data && typeof latest.structured_data === 'object' && 'message' in latest.structured_data
    ? String(latest.structured_data.message)
    : latest.response_text || ''
  if (!rawMessage) return null

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-4">
      <Card className="!bg-white dark:!bg-surface-primary border shadow-lg">
        <div className="flex items-start gap-3">
          <MochiAvatar size="sm" />
          <div className="flex-1">
            <p className="text-xs font-medium text-text-secondary mb-1">Kira says...</p>
            <p className="text-sm text-text-primary">{rawMessage}</p>
            <Button size="sm" variant="ghost" className="mt-2" onClick={handleDismiss}>
              Got it, thanks Kira
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
