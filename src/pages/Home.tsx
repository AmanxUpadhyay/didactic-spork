import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Button,
  Card,
  ThemeSwitcher,
  BarChart,
  LineChart,
  WeeklyGrid,
  LoadingState,
  EmptyState,
  BottomSheet,
  Input,
} from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'

interface HomeProps {
  profile: { name: string } | null
  onSignOut: () => void
}

export function Home({ profile, onSignOut }: HomeProps) {
  const { toast } = useToast()
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Realtime: listen for partner presence via tasks table changes
  useEffect(() => {
    const channel = supabase
      .channel('realtime-test')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          setPartnerOnline(true)
          toast('Partner is active!', 'info')
          setTimeout(() => setPartnerOnline(false), 5000)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  const demoWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => ({
    label,
    completed: i < 4,
  }))

  const demoBars = [
    { label: 'Mon', value: 3, completed: true },
    { label: 'Tue', value: 5, completed: true },
    { label: 'Wed', value: 2, completed: false },
    { label: 'Thu', value: 7, completed: true },
    { label: 'Fri', value: 4, completed: false },
  ]

  const demoLine = [
    { label: 'W1', value: 6 },
    { label: 'W2', value: 8 },
    { label: 'W3', value: 5 },
    { label: 'W4', value: 9 },
    { label: 'W5', value: 7 },
  ]

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[var(--tracking-display)]">
            Hello, {profile?.name ?? 'there'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${partnerOnline ? 'bg-success' : 'bg-border'}`}
            />
            <span className="text-sm text-text-secondary">
              {partnerOnline ? 'Partner is active' : 'Partner offline'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          Sign Out
        </Button>
      </header>

      <div className="px-5 space-y-5">
        {/* Theme Switcher */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Theme</h2>
          <ThemeSwitcher />
        </Card>

        {/* Weekly Grid */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">This Week</h2>
          <WeeklyGrid days={demoWeek} />
        </Card>

        {/* Bar Chart */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Tasks Completed</h2>
          <BarChart bars={demoBars} />
        </Card>

        {/* Line Chart */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Mood Trend</h2>
          <LineChart points={demoLine} />
        </Card>

        {/* Loading State demo */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Loading State</h2>
          <LoadingState message="Fetching your habits..." />
        </Card>

        {/* Empty State demo */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Empty State</h2>
          <EmptyState
            variant="all-done"
            title="All done for today!"
            description="You've completed every habit. Mochi is proud of you."
          />
        </Card>

        {/* Bottom Sheet demo */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Bottom Sheet</h2>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            Open Sheet
          </Button>
        </Card>

        {/* Toast demo */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Toasts</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => toast('Great job!', 'success')}>
              Success
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast('Something went wrong', 'error')}>
              Error
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast('Check this out', 'info')}>
              Info
            </Button>
          </div>
        </Card>

        {/* Input demo */}
        <Card>
          <h2 className="font-heading text-lg font-semibold mb-3">Inputs</h2>
          <div className="space-y-3">
            <Input label="Habit name" placeholder="e.g. Meditate" />
            <Input label="With error" error="This field is required" />
          </div>
        </Card>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <h2 className="font-heading text-xl font-semibold mb-3">Add New Habit</h2>
        <p className="text-sm text-text-secondary mb-4">
          This is a demo bottom sheet with spring animation.
        </p>
        <div className="space-y-3">
          <Input label="Habit title" />
          <Button className="w-full" onClick={() => setSheetOpen(false)}>
            Save
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
