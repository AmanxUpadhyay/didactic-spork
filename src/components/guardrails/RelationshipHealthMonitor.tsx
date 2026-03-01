import { useState } from 'react'
import { useRelationshipHealth } from '@/hooks/useRelationshipHealth'
import { HealthCheckPrompt } from './HealthCheckPrompt'

export function RelationshipHealthMonitor() {
  const { signals, activeCount, hasCritical } = useRelationshipHealth()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || activeCount < 3) return null

  return (
    <HealthCheckPrompt
      signals={signals}
      isCritical={hasCritical}
      onDismiss={() => setDismissed(true)}
    />
  )
}
