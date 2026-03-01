import { useState } from 'react'
import { NavBar, BottomSheet } from '@/components/ui'
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
import { NotificationOptIn } from '@/components/notifications/NotificationOptIn'
import { NotificationBadge } from '@/components/notifications/NotificationBadge'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { InAppNotificationToast } from '@/components/notifications/InAppNotificationToast'
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

interface AppShellProps {
  profile: { id: string; name: string; avatar_url: string | null; timezone: string }
  onSignOut: () => void
}

export function AppShell({ profile, onSignOut }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [habitSheetOpen, setHabitSheetOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Task | null>(null)
  const [notifCenterOpen, setNotifCenterOpen] = useState(false)
  const { partnerProfile } = usePairing()
  const { tierChanged, dismissTierChange } = useTierUnlocks()
  const { result: mysteryResult, clearResult: clearMystery, rollMysteryBox } = useMysteryBox()
  const { notifications, unreadCount, latestNotification, clearLatest, markAllRead } = useRealtimeNotifications()

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

  const navItems = [
    {
      icon: <HugeiconsIcon icon={Home03Icon} size={22} />,
      label: 'Today',
      active: activeTab === 'today',
      onClick: () => setActiveTab('today'),
    },
    {
      icon: <HugeiconsIcon icon={Award01Icon} size={22} />,
      label: 'Sprint',
      active: activeTab === 'sprint',
      onClick: () => setActiveTab('sprint'),
    },
    {
      icon: <HugeiconsIcon icon={UserIcon} size={22} />,
      label: 'Partner',
      active: activeTab === 'partner',
      onClick: () => setActiveTab('partner'),
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
      onClick: () => setActiveTab('settings'),
    },
  ]

  return (
    <div className="min-h-dvh bg-background">
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
      <ScoreGapCircuitBreaker />
      <ContemplDetectionPrompt />
      <InAppNotificationToast notification={latestNotification} onDismiss={clearLatest} />
      {activeTab === 'today' && <InstallPrompt />}
      {activeTab === 'today' && <NotificationOptIn />}
      {activeTab === 'today' && (
        <TodayScreen
          onEditHabit={handleEditHabit}
          onNavigateToSprint={() => setActiveTab('sprint')}
          onHabitComplete={rollMysteryBox}
        />
      )}
      {activeTab === 'sprint' && <SprintScreen />}
      {activeTab === 'partner' && <PartnerScreen />}
      {activeTab === 'settings' && (
        <SettingsScreen
          profile={profile}
          partnerName={partnerProfile?.name}
          onSignOut={onSignOut}
        />
      )}

      <NavBar
        items={navItems}
        fabIcon={<HugeiconsIcon icon={Add01Icon} size={24} />}
        onFabClick={handleFabClick}
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
