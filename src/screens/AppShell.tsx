import { useState } from 'react'
import { NavBar, BottomSheet } from '@/components/ui'
import { usePairing } from '@/contexts/PairingContext'
import { useTierUnlocks } from '@/hooks/useTierUnlocks'
import { TodayScreen } from './TodayScreen'
import { SprintScreen } from './SprintScreen'
import { PartnerScreen } from './PartnerScreen'
import { SettingsScreen } from './SettingsScreen'
import { HabitSheet } from '@/components/habits/HabitSheet'
import { InstallPrompt } from '@/components/ui/InstallPrompt'
import { TierUnlockCelebration } from '@/components/tier/TierUnlockCelebration'
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
  const { partnerProfile } = usePairing()
  const { tierChanged, dismissTierChange } = useTierUnlocks()

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
      icon: <HugeiconsIcon icon={Settings02Icon} size={22} />,
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
      {activeTab === 'today' && <InstallPrompt />}
      {activeTab === 'today' && (
        <TodayScreen
          onEditHabit={handleEditHabit}
          onNavigateToSprint={() => setActiveTab('sprint')}
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
    </div>
  )
}
