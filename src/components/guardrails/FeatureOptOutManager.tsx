import { useOptOut } from '@/hooks/useOptOut'
import { Card } from '@/components/ui'

const FEATURES = [
  { key: 'mystery_box', label: 'Mystery Box Rewards', desc: 'Random reward rolls after completing habits' },
  { key: 'decaying_points', label: 'Decaying Point Bank', desc: 'Points that decrease when you miss habits' },
  { key: 'streak_hostage', label: 'Streak Hostage Alerts', desc: 'Notifications when your streak is at risk' },
  { key: 'competitive_notifications', label: 'Competitive Notifications', desc: 'Score comparisons and leaderboard updates' },
  { key: 'catch_up_mechanics', label: 'Catch-Up Mechanics', desc: 'Comeback bonuses when trailing' },
  { key: 'score_gap_warnings', label: 'Score Gap Warnings', desc: 'Alerts when scores diverge significantly' },
]

export function FeatureOptOutManager() {
  const { isOptedOut, toggleOptOut, loading } = useOptOut()

  if (loading) return null

  return (
    <Card>
      <p className="text-sm font-medium text-text-primary mb-3">Feature Preferences</p>
      <div className="space-y-3">
        {FEATURES.map((f) => {
          const optedOut = isOptedOut(f.key)
          return (
            <label key={f.key} className="flex items-center justify-between cursor-pointer">
              <div className="flex-1 mr-3">
                <p className="text-sm text-text-primary">{f.label}</p>
                <p className="text-xs text-text-secondary">{f.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!optedOut}
                onClick={() => toggleOptOut(f.key)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                  optedOut
                    ? 'bg-surface-secondary'
                    : 'bg-primary'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                    optedOut ? 'translate-x-0.5' : 'translate-x-[22px]'
                  }`}
                />
              </button>
            </label>
          )
        })}
      </div>
      <p className="text-xs text-text-tertiary mt-3">
        Turning off a feature won't affect your scores — it just hides the UI.
      </p>
    </Card>
  )
}
