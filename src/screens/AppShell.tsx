import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { NavBar, BottomSheet } from '@/components/ui'
import { GeometricMask } from '@/components/ui/GeometricMask'
import { usePairing } from '@/contexts/PairingContext'
import { useTierUnlocks } from '@/hooks/useTierUnlocks'
import { useMysteryBox } from '@/hooks/useMysteryBox'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { TodayScreen } from './TodayScreen'
import { SprintScreen } from './SprintScreen'
import { PartnerScreen } from './PartnerScreen'
import { SettingsScreen } from './SettingsScreen'
import { HabitSheet } from '@/components/habits/HabitSheet'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { TierUnlockCelebration } from '@/components/tier/TierUnlockCelebration'
import { MysteryBoxReveal } from '@/components/psych/MysteryBoxReveal'
import { ScoreGapCircuitBreaker } from '@/components/guardrails/ScoreGapCircuitBreaker'
import { ContemplDetectionPrompt } from '@/components/guardrails/ContemplDetectionPrompt'
import { RelationshipHealthMonitor } from '@/components/guardrails/RelationshipHealthMonitor'
import { ProactiveKiraMessage } from '@/components/guardrails/ProactiveKiraMessage'
import { TrainingWheelsBanner } from '@/components/guardrails/TrainingWheelsBanner'
import { useTrainingWheels } from '@/hooks/useTrainingWheels'
import { NotificationOptIn } from '@/components/notifications/NotificationOptIn'
import { NotificationBadge } from '@/components/notifications/NotificationBadge'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { InAppNotificationToast } from '@/components/notifications/InAppNotificationToast'
import { kawaiiSpring, pageEnterRight, pageEnterLeft } from '@/lib/animations'
import { unlockAudio } from '@/lib/sounds'
import {
  Home03Icon,
  Award01Icon,
  UserIcon,
  Settings02Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Task } from '@/types/habits'

type Tab = 'today' | 'sprint' | 'partner' | 'settings'

const TAB_ORDER: Tab[] = ['today', 'sprint', 'partner', 'settings']

interface AppShellProps {
  profile: { id: string; name: string; avatar_url: string | null; timezone: string }
  onSignOut: () => void
}

export function AppShell({ profile, onSignOut }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [habitSheetOpen, setHabitSheetOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Task | null>(null)
  const [notifCenterOpen, setNotifCenterOpen] = useState(false)
  const [sprintFlash, setSprintFlash] = useState(false)
  const [tapOrigin, setTapOrigin] = useState({ x: 195, y: 780 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pendingTab = useRef<Tab>('today')
  const prevTabRef = useRef<Tab>('today')
  // Swipe gesture tracking
  const swipeStartX = useRef(0)
  const swipeStartY = useRef(0)
  const swipeTarget = useRef<EventTarget | null>(null)
  const { partnerProfile } = usePairing()
  const { tierChanged, dismissTierChange } = useTierUnlocks()
  const { result: mysteryResult, clearResult: clearMystery, rollMysteryBox } = useMysteryBox()
  const { notifications, unreadCount, latestNotification, clearLatest, markAllRead } = useRealtimeNotifications()
  const { isTraining } = useTrainingWheels()

  const triggerSprintFlash = useCallback(() => {
    setSprintFlash(true)
    setTimeout(() => setSprintFlash(false), 1500)
  }, [])

  // Track direction for slide animation
  const direction = TAB_ORDER.indexOf(activeTab) > TAB_ORDER.indexOf(prevTabRef.current)
    ? 'right'
    : 'left'

  useEffect(() => {
    prevTabRef.current = activeTab
  }, [activeTab])

  // Unlock Web Audio API on first user gesture (required for iOS Safari)
  useEffect(() => {
    const unlock = () => { unlockAudio(); document.removeEventListener('pointerdown', unlock) }
    document.addEventListener('pointerdown', unlock, { once: true })
    return () => document.removeEventListener('pointerdown', unlock)
  }, [])

  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0]?.clientX ?? 0
    swipeStartY.current = e.touches[0]?.clientY ?? 0
    swipeTarget.current = e.target
  }, [])

  const handleTabChange = useCallback((tabId: string, x: number, y: number) => {
    // tabId is either a TAB_ORDER index (from NavBar) or the actual Tab value (from swipe/SprintScreen)
    const tabByIndex = TAB_ORDER[parseInt(tabId)]
    const tab: Tab = (tabByIndex ?? tabId) as Tab
    if (tab === activeTab || isTransitioning) return
    setTapOrigin({ x, y })
    pendingTab.current = tab
    setIsTransitioning(true)
  }, [activeTab, isTransitioning])

  const handleMaskComplete = useCallback(() => {
    setActiveTab(pendingTab.current)
    setIsTransitioning(false)
  }, [])

  const handleSwipeEnd = useCallback((e: React.TouchEvent) => {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - swipeStartX.current
    const dy = (e.changedTouches[0]?.clientY ?? 0) - swipeStartY.current
    // Only trigger if mostly horizontal and ≥120px
    if (Math.abs(dx) < 120 || Math.abs(dy) > Math.abs(dx) * 0.6) return
    // Skip if gesture started on a draggable habit card (has data-drag attr or is inside one)
    const el = swipeTarget.current as HTMLElement | null
    if (el?.closest('[data-no-tab-swipe]')) return
    const idx = TAB_ORDER.indexOf(activeTab)
    const screenCenterX = window.innerWidth / 2
    const screenCenterY = window.innerHeight / 2
    if (dx < 0 && idx < TAB_ORDER.length - 1) {
      handleTabChange(TAB_ORDER[idx + 1]!, screenCenterX, screenCenterY)
    } else if (dx > 0 && idx > 0) {
      handleTabChange(TAB_ORDER[idx - 1]!, screenCenterX, screenCenterY)
    }
  }, [activeTab, handleTabChange])

  function handleFabClick() {
    setEditingHabit(null)
    setHabitSheetOpen(true)
  }

  function handleEditHabit(habit: Task) {
    setEditingHabit(habit)
    setHabitSheetOpen(true)
  }

  function handleSheetClose() {
    setHabitSheetOpen(false)
    setEditingHabit(null)
  }

  const TAB_COLORS: Record<Tab, string> = {
    today: 'color-mix(in srgb, var(--color-primary) 80%, white)',
    sprint: 'color-mix(in srgb, var(--color-secondary) 80%, white)',
    partner: 'color-mix(in srgb, var(--color-accent, var(--color-primary)) 80%, white)',
    settings: 'color-mix(in srgb, var(--color-text-secondary) 60%, white)',
  }

  const navItems = [
    {
      icon: <HugeiconsIcon icon={Home03Icon} size={22} />,
      label: 'Today',
      active: activeTab === 'today',
      onClick: () => {},
      onClickWithCoords: (x: number, y: number) => handleTabChange('today', x, y),
    },
    {
      icon: <HugeiconsIcon icon={Award01Icon} size={22} />,
      label: 'Sprint',
      active: activeTab === 'sprint',
      onClick: () => {},
      onClickWithCoords: (x: number, y: number) => handleTabChange('sprint', x, y),
    },
    {
      icon: <HugeiconsIcon icon={UserIcon} size={22} />,
      label: 'Partner',
      active: activeTab === 'partner',
      onClick: () => {},
      onClickWithCoords: (x: number, y: number) => handleTabChange('partner', x, y),
    },
    {
      icon: (
        <span className="relative">
          <HugeiconsIcon icon={Settings02Icon} size={22} />
          <span className="absolute -top-1.5 -right-1.5"><NotificationBadge count={unreadCount} /></span>
        </span>
      ),
      label: 'Settings',
      active: activeTab === 'settings',
      onClick: () => {},
      onClickWithCoords: (x: number, y: number) => handleTabChange('settings', x, y),
    },
  ]

  // Background zoom-out when any bottom sheet is open (physics-of-touch pattern)
  const anySheetOpen = habitSheetOpen || notifCenterOpen

  return (
    <div
      className="min-h-dvh overflow-hidden"
      style={{ background: 'var(--bg-gradient), var(--color-bg)' }}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}
    >
      {tierChanged && (
        <TierUnlockCelebration
          from={tierChanged.from}
          to={tierChanged.to}
          onDismiss={dismissTierChange}
        />
      )}
      {mysteryResult?.triggered && mysteryResult.reward && (
        <MysteryBoxReveal reward={mysteryResult.reward} onDismiss={clearMystery} />
      )}
      <RelationshipHealthMonitor />
      <ProactiveKiraMessage />
      <ScoreGapCircuitBreaker />
      <ContemplDetectionPrompt />
      <InAppNotificationToast notification={latestNotification} onDismiss={clearLatest} />
      {isTraining && <TrainingWheelsBanner className="mx-5 mt-2" />}
      {activeTab === 'today' && <InstallPrompt />}
      {activeTab === 'today' && <NotificationOptIn />}

      {/* Background zoom-out wrapper — springs back when sheet opens (physics-of-touch pattern) */}
      <m.div
        initial={false}
        animate={{
          scale: anySheetOpen ? 0.96 : 1,
          y: anySheetOpen ? -8 : 0,
          filter: anySheetOpen ? 'blur(2px)' : 'blur(0px)',
        }}
        transition={kawaiiSpring}
        style={{ transformOrigin: 'top center' }}
      >
      {/* Direction-aware tab transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={activeTab}
          variants={direction === 'right' ? pageEnterRight : pageEnterLeft}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="pb-20"
        >
          {activeTab === 'today' && (
            <TodayScreen
              onEditHabit={handleEditHabit}
              onNavigateToSprint={() => handleTabChange('sprint', window.innerWidth / 2, window.innerHeight / 2)}
              onHabitComplete={(id) => { rollMysteryBox(id); triggerSprintFlash() }}
            />
          )}
          {activeTab === 'sprint' && <SprintScreen onTabChange={(tab) => handleTabChange(tab, window.innerWidth / 2, window.innerHeight / 2)} />}
          {activeTab === 'partner' && <PartnerScreen />}
          {activeTab === 'settings' && (
            <SettingsScreen
              profile={profile}
              partnerName={partnerProfile?.name}
              onSignOut={onSignOut}
            />
          )}
        </m.div>
      </AnimatePresence>

      <NavBar
        items={navItems}
        fabIcon={<HugeiconsIcon icon={Add01Icon} size={24} />}
        onFabClick={handleFabClick}
        onTabChange={handleTabChange}
        flashTabIndex={sprintFlash ? 1 : undefined}
      />
      </m.div>{/* end background zoom wrapper */}

      {/* Geometric mask tab transition overlay */}
      <GeometricMask
        isTransitioning={isTransitioning}
        originX={tapOrigin.x}
        originY={tapOrigin.y}
        color={TAB_COLORS[pendingTab.current]}
        onComplete={handleMaskComplete}
      />

      <BottomSheet open={habitSheetOpen} onClose={handleSheetClose}>
        <HabitSheet
          onClose={handleSheetClose}
          userId={profile.id}
          editHabit={editingHabit ?? undefined}
        />
      </BottomSheet>

      <BottomSheet open={notifCenterOpen} onClose={() => { setNotifCenterOpen(false); markAllRead() }}>
        <div className="px-5 py-4">
          <NotificationCenter notifications={notifications} onMarkAllRead={markAllRead} />
        </div>
      </BottomSheet>
    </div>
  )
}
