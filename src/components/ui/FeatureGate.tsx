import type { ReactNode } from 'react'
import { useTierUnlocks } from '@/hooks/useTierUnlocks'
import { getTierDisplayName, getFeatureUnlockTier, type Feature } from '@/lib/tierGating'

interface FeatureGateProps {
  feature: Feature
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function FeatureGate({ feature, children, fallback, className = '' }: FeatureGateProps) {
  const { isUnlocked, loading } = useTierUnlocks()

  if (loading) return null

  if (isUnlocked(feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const requiredTier = getFeatureUnlockTier(feature)

  return (
    <div className={`relative rounded-2xl border-2 border-dashed border-border/50 p-4 ${className}`}>
      <div className="flex items-center gap-2 text-text-secondary">
        <span className="text-base">{'\uD83D\uDD12'}</span>
        <span className="text-xs font-medium">
          Unlock at {getTierDisplayName(requiredTier)}
        </span>
      </div>
    </div>
  )
}
