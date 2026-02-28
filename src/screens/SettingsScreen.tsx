import { useState } from 'react'
import { Card, Button, BottomSheet, ThemeSwitcher, MochiAvatar } from '@/components/ui'
import { FeatureGate } from '@/components/ui/FeatureGate'
import { TierProgressHub } from '@/components/tier/TierProgressHub'
import { PrestigeBadge } from '@/components/tier/PrestigeBadge'
import { DateHistoryList } from '@/components/punishment/DateHistoryList'
import { useTierUnlocks } from '@/hooks/useTierUnlocks'
import { getTierDisplayName, getNextTier, getTierThreshold } from '@/lib/tierGating'

interface SettingsScreenProps {
  profile: { id: string; name: string; avatar_url: string | null; timezone: string }
  partnerName?: string
  onSignOut: () => void
}

export function SettingsScreen({ profile, partnerName, onSignOut }: SettingsScreenProps) {
  const { tier, tp, prestige } = useTierUnlocks()
  const [tierHubOpen, setTierHubOpen] = useState(false)
  const [dateHistoryOpen, setDateHistoryOpen] = useState(false)

  const nextTier = getNextTier(tier)
  const nextTierTp = nextTier ? getTierThreshold(nextTier) : getTierThreshold(tier)
  const progress = nextTier ? Math.min(1, tp / nextTierTp) : 1

  return (
    <div className="px-5 pt-6 pb-24 space-y-4">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Settings</h1>

      {/* Tier card — clickable to open TierProgressHub */}
      <Card
        className="cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => setTierHubOpen(true)}
      >
        <div className="flex items-center gap-4">
          <MochiAvatar size="sm" className="rounded-full bg-primary/10" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-semibold text-text-primary">{profile.name}</p>
              {prestige > 0 && <PrestigeBadge level={prestige} />}
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-[var(--radius-pill)] bg-primary/10 text-primary text-xs font-semibold">
              {getTierDisplayName(tier)}
            </span>
            {nextTier && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>{tp} TP</span>
                  <span>{nextTierTp} TP to {getTierDisplayName(nextTier)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}
            {!nextTier && (
              <p className="text-xs text-text-secondary mt-1">{tp} TP — Max tier reached!</p>
            )}
          </div>
          <span className="text-text-secondary text-sm">{'\u203A'}</span>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h2 className="font-heading text-base font-semibold text-text-primary">Theme</h2>
          <FeatureGate feature="custom_themes" fallback={
            <div>
              <ThemeSwitcher />
              <p className="text-xs text-text-secondary mt-2 opacity-60">
                More themes at Sprout tier
              </p>
            </div>
          }>
            <ThemeSwitcher />
          </FeatureGate>
        </div>
      </Card>

      {/* Date History link */}
      <Card
        className="cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => setDateHistoryOpen(true)}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-text-primary">Date History</h2>
          <span className="text-text-secondary text-sm">{'\u203A'}</span>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <h2 className="font-heading text-base font-semibold text-text-primary">Notifications</h2>
          <p className="text-sm text-text-secondary opacity-50">Coming in Phase 5</p>
        </div>
      </Card>

      {partnerName && (
        <Card>
          <div className="space-y-1">
            <h2 className="font-heading text-base font-semibold text-text-primary">Partner</h2>
            <p className="text-sm text-text-secondary">{partnerName}</p>
          </div>
        </Card>
      )}

      <Button variant="ghost" className="w-full" onClick={onSignOut}>
        Sign Out
      </Button>

      {/* Tier Progress Hub bottom sheet */}
      <BottomSheet open={tierHubOpen} onClose={() => setTierHubOpen(false)}>
        <div className="px-5 py-4">
          <TierProgressHub />
        </div>
      </BottomSheet>

      {/* Date History bottom sheet */}
      <BottomSheet open={dateHistoryOpen} onClose={() => setDateHistoryOpen(false)}>
        <div className="px-5 py-4">
          <DateHistoryList />
        </div>
      </BottomSheet>
    </div>
  )
}
