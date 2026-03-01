import { m, AnimatePresence } from 'motion/react'
import { ConfettiCelebration } from '@/components/ui/ConfettiCelebration'
import { KiraAvatar } from '@/components/kira/KiraAvatar'
import { Button } from '@/components/ui'
import { getTierDisplayName, getNewFeaturesForTier, type TierName } from '@/lib/tierGating'
import { kawaiiSpring, gentleSpring } from '@/lib/animations'

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

  return (
    <AnimatePresence>
      <m.div
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <m.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onDismiss}
        />

        <ConfettiCelebration show onComplete={() => {}} intensity="large" />

        {/* Card */}
        <m.div
          className="relative w-full max-w-sm rounded-3xl bg-surface border-2 border-primary/30 p-6 shadow-xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ ...kawaiiSpring, delay: 0.15 }}
        >
          {/* Sparkle ring */}
          <m.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.5, 0, 0],
            }}
            transition={{ duration: 0.9, repeat: 2, ease: 'easeOut' }}
            style={{
              background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent 70%)',
            }}
          />

          <div className="text-center">
            {/* Badge with rotation spring */}
            <m.div
              className="mx-auto mb-3 w-fit"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ ...kawaiiSpring, delay: 0.3 }}
            >
              <KiraAvatar mood="hype_man" size="lg" />
            </m.div>

            <m.h2
              className="font-heading text-xl font-bold text-text-primary mb-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...gentleSpring, delay: 0.5 }}
            >
              Tier Up!
            </m.h2>

            <m.p
              className="text-sm text-text-secondary mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.65 }}
            >
              {getTierDisplayName(from)} {'→'} {getTierDisplayName(to)}
            </m.p>

            {newFeatures.length > 0 && (
              <m.div
                className="bg-primary/5 rounded-2xl p-3 mb-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...gentleSpring, delay: 0.75 }}
              >
                <p className="text-xs font-semibold text-primary mb-2">New unlocks:</p>
                <ul className="space-y-1">
                  {newFeatures.map((f) => (
                    <li key={f} className="text-sm text-text-primary flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      {FEATURE_LABELS[f] || f}
                    </li>
                  ))}
                </ul>
              </m.div>
            )}

            <m.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...kawaiiSpring, delay: 0.9 }}
            >
              <Button onClick={onDismiss} className="w-full">
                Let's go!
              </Button>
            </m.div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  )
}
