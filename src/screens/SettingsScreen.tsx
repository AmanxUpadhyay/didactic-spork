import { useState, useEffect } from 'react'
import { Card, Button, ThemeSwitcher, MochiAvatar } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const TIER_THRESHOLDS: Record<string, { next: string | null; tp: number }> = {
  seedling: { next: 'sprout', tp: 30 },
  sprout: { next: 'bloom', tp: 120 },
  bloom: { next: 'mighty_oak', tp: 300 },
  mighty_oak: { next: 'unshakeable', tp: 600 },
  unshakeable: { next: null, tp: 600 },
}

const TIER_LABELS: Record<string, string> = {
  seedling: 'Seedling',
  sprout: 'Sprout',
  bloom: 'Bloom',
  mighty_oak: 'Mighty Oak',
  unshakeable: 'Unshakeable',
}

interface SettingsScreenProps {
  profile: { id: string; name: string; avatar_url: string | null; timezone: string }
  partnerName?: string
  onSignOut: () => void
}

export function SettingsScreen({ profile, partnerName, onSignOut }: SettingsScreenProps) {
  const [tier, setTier] = useState<{ current_tier: string; current_tp: number } | null>(null)

  useEffect(() => {
    supabase
      .from('tier_progress')
      .select('current_tier, current_tp')
      .eq('user_id', profile.id)
      .maybeSingle()
      .then(({ data }) => {
        setTier(data ?? { current_tier: 'seedling', current_tp: 0 })
      })
  }, [profile.id])

  const tierName = tier?.current_tier ?? 'seedling'
  const currentTp = tier?.current_tp ?? 0
  const info = TIER_THRESHOLDS[tierName] ?? { next: 'sprout', tp: 30 }
  const nextTierTp = info.tp
  const progress = info.next ? Math.min(1, currentTp / nextTierTp) : 1

  return (
    <div className="px-5 pt-6 pb-24 space-y-4">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Settings</h1>

      <Card>
        <div className="flex items-center gap-4">
          <MochiAvatar size="sm" className="rounded-full bg-primary/10" />
          <div className="flex-1">
            <p className="font-heading text-lg font-semibold text-text-primary">{profile.name}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-[var(--radius-pill)] bg-primary/10 text-primary text-xs font-semibold">
              {TIER_LABELS[tierName] ?? 'Seedling'}
            </span>
            {info.next && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>{currentTp} TP</span>
                  <span>{nextTierTp} TP to {TIER_LABELS[info.next]}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            )}
            {!info.next && (
              <p className="text-xs text-text-secondary mt-1">{currentTp} TP — Max tier reached!</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h2 className="font-heading text-base font-semibold text-text-primary">Theme</h2>
          <ThemeSwitcher />
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
    </div>
  )
}
