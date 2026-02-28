import { ConfettiCelebration } from '@/components/ui/ConfettiCelebration'
import { KiraAvatar } from '@/components/kira/KiraAvatar'
import { Button } from '@/components/ui'
import { getTierDisplayName, getNewFeaturesForTier, type TierName } from '@/lib/tierGating'

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

interface TierUnlockCelebrationProps {
  from: TierName
  to: TierName
  onDismiss: () => void
}

export function TierUnlockCelebration({ from, to, onDismiss }: TierUnlockCelebrationProps) {
  const newFeatures = getNewFeaturesForTier(to)
  const isUpgrade = true // from tier index < to tier index

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <ConfettiCelebration show onComplete={() => {}} />

      <div className="relative w-full max-w-sm rounded-3xl bg-surface border-2 border-primary/30 p-6 shadow-xl animate-[bouncy_600ms_var(--ease-bouncy)]">
        <div className="text-center">
          <KiraAvatar mood="hype_man" size="lg" className="mx-auto mb-3" />

          <h2 className="font-heading text-xl font-bold text-text-primary mb-1">
            {isUpgrade ? 'Tier Up!' : 'Tier Changed'}
          </h2>

          <p className="text-sm text-text-secondary mb-3">
            {getTierDisplayName(from)} {'→'} {getTierDisplayName(to)}
          </p>

          {newFeatures.length > 0 && (
            <div className="bg-primary/5 rounded-2xl p-3 mb-4">
              <p className="text-xs font-semibold text-primary mb-2">New unlocks:</p>
              <ul className="space-y-1">
                {newFeatures.map((f) => (
                  <li key={f} className="text-sm text-text-primary flex items-center gap-2">
                    <span className="text-primary">{'\u2713'}</span>
                    {FEATURE_LABELS[f] || f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onDismiss} className="w-full">
            Let's go!
          </Button>
        </div>
      </div>
    </div>
  )
}
