import { useAuth } from '@/hooks/useAuth'
import { usePairing } from '@/contexts/PairingContext'
import { usePartnerHabits } from '@/hooks/usePartnerHabits'
import { EmptyState } from '@/components/ui'
import { PartnerHabitCard } from '@/components/partner/PartnerHabitCard'
import { PartnerStatusBadge } from '@/components/partner/PartnerStatusBadge'
import { HabitCardSkeleton } from '@/components/habits/HabitCardSkeleton'
import { isHabitDueToday } from '@/lib/dates'

export function PartnerScreen() {
  const { profile } = useAuth()
  const { partnerId, partnerProfile } = usePairing()
  const partnerTz = partnerProfile?.timezone || 'UTC'
  const { habits, loading, isPartnerCompletedToday } = usePartnerHabits(partnerId, partnerTz)

  const dueHabits = habits.filter((h) =>
    isHabitDueToday(h.recurrence, h.custom_days, partnerTz),
  )

  // Sort: pending first, completed sunk to bottom
  const sorted = [...dueHabits].sort((a, b) => {
    const aDone = isPartnerCompletedToday(a.id)
    const bDone = isPartnerCompletedToday(b.id)
    if (aDone && !bDone) return 1
    if (!aDone && bDone) return -1
    return 0
  })

  if (loading) {
    return (
      <div className="px-5 pt-6 pb-24 space-y-3">
        <HabitCardSkeleton />
        <HabitCardSkeleton />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">
            {partnerProfile?.name ? `${partnerProfile.name}'s Habits` : 'Partner'}
          </h1>
        </div>
        {profile && partnerId && (
          <PartnerStatusBadge partnerId={partnerId} userId={profile.id} />
        )}
      </div>

      {habits.length === 0 ? (
        <EmptyState
          title="No habits yet"
          description="Your partner hasn't added any habits yet"
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          variant="all-done"
          title="Nothing due today"
          description="Your partner has a day off"
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((habit) => (
            <PartnerHabitCard
              key={habit.id}
              title={habit.title}
              difficulty={habit.difficulty}
              completed={isPartnerCompletedToday(habit.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
