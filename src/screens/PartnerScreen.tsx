import { useState, useRef, type ReactNode } from 'react'
import { m } from 'motion/react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Plant01Icon, PartyIcon, FireIcon, SleepingIcon, MailLove01Icon } from '@hugeicons/core-free-icons'
import { useAuth } from '@/hooks/useAuth'
import { usePairing } from '@/contexts/PairingContext'
import { usePartnerHabits } from '@/hooks/usePartnerHabits'
import { useStreaks } from '@/hooks/useStreaks'
import { EmptyState, Button, Card } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
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
  const { toast } = useToast()
  const [boostSentToday, setBoostSentToday] = useState(() => {
    const today = new Date().toISOString().slice(0, 10)
    return localStorage.getItem(`boost_sent_${today}`) === '1'
  })
  const [mochiDancing, setMochiDancing] = useState(false)
  const [boostComposing, setBoostComposing] = useState(false)
  const [boostMessage, setBoostMessage] = useState('')
  const [boostSending, setBoostSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  function getMochiConfig(): { src: string; message: ReactNode } {
    if (!partnerId) return { src: '/image/mochi-curious.png', message: <span>No partner linked yet <HugeiconsIcon icon={Plant01Icon} size={14} className="inline-block align-text-bottom" /></span> }
    if (isAllDone) return { src: '/image/mochi-celebrate.png', message: <span>{partnerName} crushed it today! <HugeiconsIcon icon={PartyIcon} size={14} className="inline-block align-text-bottom" /></span> }
    if (doneCount > 0) return { src: '/image/mochi-happy-bounce.png', message: <span>{partnerName} did {doneCount}/{total} <HugeiconsIcon icon={FireIcon} size={14} className="inline-block align-text-bottom" /></span> }
    return { src: '/image/mochi-sleep.png', message: <span>{partnerName}'s taking it slow today... <HugeiconsIcon icon={SleepingIcon} size={14} className="inline-block align-text-bottom" /></span> }
  }

  function handleBoost() {
    if (boostSentToday || !partnerId || !profile) return
    setBoostComposing(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  async function handleBoostSend() {
    if (!partnerId || !profile || boostSending) return
    setBoostSending(true)

    const senderName = profile.name || 'Your partner'
    const customMsg = boostMessage.trim()
    const body = customMsg
      ? `${senderName}: ${customMsg}`
      : `${senderName} is cheering you on!`

    const today = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('notification_queue').insert({
      user_id: partnerId,
      category: 'boost' as const,
      title: `💪 Boost from ${senderName}`,
      body,
      scheduled_for: new Date().toISOString(),
      status: 'pending',
    })

    setBoostSending(false)

    if (error) {
      toast('Could not send boost. Try again.', 'error')
      return
    }

    localStorage.setItem(`boost_sent_${today}`, '1')
    setBoostSentToday(true)
    setBoostComposing(false)
    setBoostMessage('')
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
      <h1 className="font-heading text-3xl font-bold tracking-[var(--tracking-display)] text-text-primary mb-4">
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
        <Card className="flex-[2] p-3 text-center">
          <p className="font-accent font-bold text-2xl text-primary flex items-center justify-center gap-1"><HugeiconsIcon icon={FireIcon} size={20} /> {coupleStreak}</p>
          <p className="text-xs font-heading text-text-secondary tracking-wide">couple streak</p>
        </Card>
        <Card className="flex-[1] p-3 text-center">
          <p className="font-accent font-bold text-base text-secondary">{lastActiveText}</p>
          <p className="text-xs font-heading text-text-secondary tracking-wide">last active</p>
        </Card>
      </div>

      {/* Boost button / compose */}
      {boostComposing ? (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-[var(--radius-card)] p-4 mb-4 space-y-3"
        >
          <textarea
            ref={textareaRef}
            value={boostMessage}
            onChange={(e) => setBoostMessage(e.target.value.slice(0, 280))}
            placeholder="Add a message... (optional)"
            rows={3}
            className="w-full resize-none rounded-[var(--radius-input)] bg-background border-2 border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2">
            <m.button
              onClick={handleBoostSend}
              disabled={boostSending}
              whileTap={{ scale: 0.96 }}
              className="flex-1 bg-primary text-white rounded-full font-semibold py-2.5 text-sm disabled:opacity-50"
            >
              {boostSending
                ? 'Sending…'
                : <span className="flex items-center justify-center gap-2"><HugeiconsIcon icon={MailLove01Icon} size={16} /> Send boost</span>
              }
            </m.button>
            <Button variant="secondary" size="sm"
              onClick={() => { setBoostComposing(false); setBoostMessage('') }}>
              Cancel
            </Button>
          </div>
        </m.div>
      ) : (
        <m.button
          onClick={handleBoost}
          disabled={boostSentToday}
          whileTap={!boostSentToday ? { scale: 0.96 } : {}}
          className="w-full bg-primary text-white rounded-full font-semibold py-3 mb-4 disabled:opacity-50 transition-opacity"
        >
          {boostSentToday
            ? <span className="flex items-center justify-center gap-2"><HugeiconsIcon icon={MailLove01Icon} size={18} /> Boost sent!</span>
            : <span className="flex items-center justify-center gap-2"><HugeiconsIcon icon={MailLove01Icon} size={18} /> Send a boost</span>
          }
        </m.button>
      )}

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
