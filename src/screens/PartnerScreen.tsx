import { useState } from 'react'
import { m } from 'motion/react'
import { useAuth } from '@/hooks/useAuth'
import { usePairing } from '@/contexts/PairingContext'
import { usePartnerHabits } from '@/hooks/usePartnerHabits'
import { useStreaks } from '@/hooks/useStreaks'
import { EmptyState } from '@/components/ui'
import { PartnerHabitCard } from '@/components/partner/PartnerHabitCard'
import { HabitCardSkeleton } from '@/components/habits/HabitCardSkeleton'
import { isHabitDueToday } from '@/lib/dates'
import { supabase } from '@/lib/supabase'

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return 'yesterday'
  return `${Math.floor(hours / 24)}d ago`
}

export function PartnerScreen() {
  const { profile } = useAuth()
  const { partnerId, partnerProfile } = usePairing()
  const partnerTz = partnerProfile?.timezone || 'UTC'
  const { habits, loading, isPartnerCompletedToday } = usePartnerHabits(partnerId, partnerTz)
  const { bestCoupleStreak } = useStreaks(profile?.id)
  const [boostSentToday, setBoostSentToday] = useState(() => {
    const today = new Date().toISOString().slice(0, 10)
    return localStorage.getItem(`boost_sent_${today}`) === '1'
  })
  const [mochiDancing, setMochiDancing] = useState(false)

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

  const doneCount = dueHabits.filter((h) => isPartnerCompletedToday(h.id)).length
  const total = dueHabits.length
  const partnerName = partnerProfile?.name || 'Your partner'
  const isAllDone = total > 0 && doneCount === total

  function getMochiConfig() {
    if (!partnerId) return { src: '/image/mochi-curious.png', message: 'No partner linked yet 🌱' }
    if (isAllDone) return { src: '/image/mochi-celebrate.png', message: `${partnerName} crushed it today! 🎉` }
    if (doneCount > 0) return { src: '/image/mochi-happy-bounce.png', message: `${partnerName} did ${doneCount}/${total} 🔥` }
    return { src: '/image/mochi-sleep.png', message: `${partnerName}'s taking it slow today... 💤` }
  }

  async function handleBoost() {
    if (boostSentToday || !partnerId || !profile) return

    const today = new Date().toISOString().slice(0, 10)
    try {
      await supabase.from('notification_queue').insert({
        user_id: partnerId,
        category: 'nudge' as const,
        title: '💪 Boost from ' + (profile.name || 'your partner'),
        body: `${profile.name || 'Your partner'} is cheering you on!`,
        scheduled_for: new Date().toISOString(),
        status: 'pending',
      })
    } catch (_) {
      // best-effort, don't block UI
    }

    localStorage.setItem(`boost_sent_${today}`, '1')
    setBoostSentToday(true)
    setMochiDancing(true)
    setTimeout(() => setMochiDancing(false), 1000)
  }

  function handleMochiTap() {
    setMochiDancing(true)
    setTimeout(() => setMochiDancing(false), 800)
  }

  const { src: mochiSrc, message: mochiMessage } = getMochiConfig()
  const lastActiveText = formatRelativeTime((partnerProfile as any)?.updated_at)
  const coupleStreak = bestCoupleStreak?.current_days ?? 0

  if (loading) {
    return (
      <div className="px-5 pt-6 pb-24 space-y-3">
        <HabitCardSkeleton />
        <HabitCardSkeleton />
      </div>
    )
  }

  if (!partnerId) {
    return (
      <div className="px-5 pt-6 pb-24">
        <EmptyState
          title="No partner yet"
          description="Link up with your partner to see their habits"
        />
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Header */}
      <h1 className="font-heading text-4xl font-extrabold tracking-tight text-text-primary mb-4">
        Partner
      </h1>

      {/* Mochi with speech bubble */}
      <div className="flex items-start gap-3 mb-4">
        <m.img
          src={mochiDancing ? '/image/mochi-dance.png' : (boostSentToday && isAllDone ? '/image/mochi-sparkle.png' : mochiSrc)}
          alt="Mochi"
          className="w-20 h-20 object-cover object-[center_top] shrink-0 cursor-pointer"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          onClick={handleMochiTap}
          whileTap={{ scale: 0.85 }}
        />
        <div className="flex-1 bg-surface rounded-2xl px-4 py-3 shadow-sm border border-border relative mt-2">
          {/* Speech bubble tail — border layer */}
          <div className="absolute left-[-6px] top-4 w-0 h-0
            border-t-[6px] border-t-transparent
            border-r-[6px] border-r-border
            border-b-[6px] border-b-transparent" />
          {/* Speech bubble tail — fill layer */}
          <div className="absolute left-[-5px] top-[17px] w-0 h-0
            border-t-[5px] border-t-transparent
            border-r-[5px] border-r-surface
            border-b-[5px] border-b-transparent" />
          <p className="font-body text-sm text-text-primary">{mochiMessage}</p>
        </div>
      </div>

      {/* Stats strip — asymmetric: streak wide, last active narrow */}
      <div className="flex gap-3 mb-4">
        <div className="flex-[2] bg-surface rounded-[var(--radius-card)] p-3 text-center border border-border">
          <p className="font-accent font-bold text-2xl text-primary">🔥 {coupleStreak}</p>
          <p className="text-xs font-heading text-text-secondary tracking-wide">couple streak</p>
        </div>
        <div className="flex-[1] bg-surface rounded-[var(--radius-card)] p-3 text-center border border-border">
          <p className="font-accent font-bold text-base text-secondary">{lastActiveText}</p>
          <p className="text-xs font-heading text-text-secondary tracking-wide">last active</p>
        </div>
      </div>

      {/* Boost button */}
      <m.button
        onClick={handleBoost}
        disabled={boostSentToday}
        whileTap={!boostSentToday ? { scale: 0.96 } : {}}
        className="w-full bg-primary text-white rounded-full font-semibold py-3 mb-4 disabled:opacity-50 transition-opacity"
      >
        {boostSentToday ? 'Boost sent! 💌' : '💪 Send a boost'}
      </m.button>

      {/* Habit list */}
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
