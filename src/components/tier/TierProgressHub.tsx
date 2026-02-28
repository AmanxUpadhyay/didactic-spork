import { Card, Button } from '@/components/ui'
import { useTierUnlocks } from '@/hooks/useTierUnlocks'
import { PrestigeBadge } from './PrestigeBadge'
import {
  getTierDisplayName,
  getTierThreshold,
  getNextTier,
  getNewFeaturesForTier,
  type TierName,
} from '@/lib/tierGating'

const TIER_COLORS: Record<TierName, string> = {
  seedling: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  sprout: 'bg-lime-100 text-lime-700 border-lime-200',
  bloom: 'bg-pink-100 text-pink-700 border-pink-200',
  mighty_oak: 'bg-amber-100 text-amber-700 border-amber-200',
  unshakeable: 'bg-violet-100 text-violet-700 border-violet-200',
}

const FEATURE_LABELS: Record<string, string> = {
  custom_themes: 'Custom themes',
  streak_freeze: 'Streak freeze',
  ai_task_suggestions: 'AI task suggestions',
  personality_modes: 'Kira personality modes',
  bonus_veto: 'Bonus veto on dates',
  couple_rescue: 'Couple rescue',
  surprise_dates: 'Surprise date elements',
  prestige_reset: 'Prestige reset',
}

const ALL_TIERS: TierName[] = ['seedling', 'sprout', 'bloom', 'mighty_oak', 'unshakeable']

interface TierProgressHubProps {
  className?: string
}

export function TierProgressHub({ className = '' }: TierProgressHubProps) {
  const { tier, tp, prestige, loading, triggerPrestige } = useTierUnlocks()

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <div className="h-48" />
      </Card>
    )
  }

  const nextTier = getNextTier(tier)
  const nextTierTp = nextTier ? getTierThreshold(nextTier) : getTierThreshold(tier)
  const progress = nextTier ? Math.min(1, tp / nextTierTp) : 1

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h2 className="font-heading text-xl font-semibold text-text-primary mb-1">
          Tier Progress
        </h2>
        {prestige > 0 && <PrestigeBadge level={prestige} className="mx-auto" />}
      </div>

      {/* Current tier card */}
      <Card className="!bg-primary/5">
        <div className="text-center">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${TIER_COLORS[tier]}`}>
            {getTierDisplayName(tier)}
          </span>
          <p className="text-2xl font-accent font-bold text-text-primary mt-2">{tp} TP</p>
          {nextTier ? (
            <>
              <div className="w-full h-2 rounded-full bg-surface-secondary mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {nextTierTp - tp} TP to {getTierDisplayName(nextTier)}
              </p>
            </>
          ) : (
            <p className="text-xs text-text-secondary mt-2">Max tier reached!</p>
          )}
        </div>
      </Card>

      {/* Prestige button */}
      {tier === 'unshakeable' && (
        <Button
          onClick={triggerPrestige}
          variant="ghost"
          className="w-full !border-violet-200 !text-violet-700"
        >
          Prestige Reset (restart from Bloom)
        </Button>
      )}

      {/* All tiers with unlocks */}
      <div className="space-y-2">
        {ALL_TIERS.map((t) => {
          const tierIdx = ALL_TIERS.indexOf(t)
          const currentIdx = ALL_TIERS.indexOf(tier)
          const isUnlocked = tierIdx <= currentIdx
          const isCurrent = t === tier
          const features = getNewFeaturesForTier(t)

          return (
            <div
              key={t}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${
                isCurrent
                  ? 'border-primary/30 bg-primary/5'
                  : isUnlocked
                  ? 'border-border bg-surface'
                  : 'border-border/50 bg-surface-secondary/30 opacity-60'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUnlocked ? TIER_COLORS[t] : 'bg-surface-secondary text-text-secondary'
                }`}
              >
                {getTierThreshold(t)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-text-primary'}`}>
                  {getTierDisplayName(t)}
                  {isCurrent && <span className="text-xs font-normal text-text-secondary ml-1">(current)</span>}
                </p>
                {features.length > 0 && (
                  <p className="text-xs text-text-secondary mt-0.5">
                    Unlocks: {features.map((f) => FEATURE_LABELS[f] || f).join(', ')}
                  </p>
                )}
              </div>
              {isUnlocked && (
                <span className="text-xs text-primary font-medium shrink-0">
                  {'\u2713'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
