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
    <div className={`relative rounded-2xl border-2 border-dashed border-primary/35 overflow-hidden ${className}`}>
      {/* Blurred preview of children */}
      <div className="blur-sm opacity-60 pointer-events-none select-none p-4">
        {children}
      </div>
      {/* Overlay with lock message */}
      <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-[2px] rounded-2xl">
        <div className="flex items-center gap-2 bg-surface/90 rounded-xl px-3 py-2 shadow-sm border border-border">
          <img src="/image/mochi-curious.png" alt="" className="w-10 h-10 object-cover object-[center_top]" />
          <span className="text-xs font-medium text-text-secondary">
            Unlock at {getTierDisplayName(requiredTier)} 🌱
          </span>
        </div>
      </div>
    </div>
  )
}
