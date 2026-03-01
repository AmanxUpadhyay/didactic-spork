import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { IOSInstallFlow } from './iOSInstallFlow'

const CATEGORIES = [
  { key: 'morning_briefing', label: 'Morning Briefing', desc: 'Daily habit summary' },
  { key: 'partner_activity', label: 'Partner Activity', desc: 'When your partner completes habits' },
  { key: 'streak_warning', label: 'Streak Warnings', desc: 'When your streak is at risk' },
  { key: 'sprint_results', label: 'Sprint Results', desc: 'Weekly competition results' },
  { key: 'mood_checkin', label: 'Mood Check-in', desc: 'Daily mood prompts' },
  { key: 'nudge', label: 'Nudges', desc: 'Gentle reminders to stay on track' },
  { key: 'celebration', label: 'Celebrations', desc: 'Milestone and streak celebrations' },
  { key: 'task_deadline', label: 'Deadlines', desc: 'Task deadline reminders' },
  { key: 'sprint_start', label: 'Sprint Start', desc: 'When a new sprint begins' },
] as const

export function NotificationSettings() {
  const { permission, isSupported, iosNeedsInstall, requestPermission, disableNotifications, loading } = useNotificationPermission()
  const { prefs, updatePrefs, toggleCategory } = useNotificationPreferences()
  const [testSent, setTestSent] = useState(false)

  if (!isSupported) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-text-secondary">
          Push notifications are not supported in this browser.
        </p>
      </div>
    )
  }

  if (iosNeedsInstall) {
    return <IOSInstallFlow />
  }

  async function handleTestNotification() {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification('Jugalbandi Test', {
        body: 'Notifications are working! 🎉',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'test',
      })
      setTestSent(true)
      setTimeout(() => setTestSent(false), 3000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Push Notifications</p>
            <p className="text-xs text-text-secondary">
              {permission === 'granted' ? 'Notifications enabled' : 'Notifications disabled'}
            </p>
          </div>
          {permission === 'granted' ? (
            <Button size="sm" variant="ghost" onClick={disableNotifications} disabled={loading}>
              Disable
            </Button>
          ) : (
            <Button size="sm" onClick={requestPermission} disabled={loading}>
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
          )}
        </div>
      </Card>

      {permission === 'granted' && (
        <>
          {/* Category toggles */}
          <Card>
            <h3 className="text-sm font-medium text-text-primary mb-3">Categories</h3>
            <div className="space-y-3">
              {CATEGORIES.map(({ key, label, desc }) => {
                const enabled = prefs.categories_enabled?.[key] !== false
                return (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => toggleCategory(key, e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm text-text-primary">{label}</p>
                      <p className="text-xs text-text-secondary">{desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </Card>

          {/* Quiet hours */}
          <Card>
            <h3 className="text-sm font-medium text-text-primary mb-3">Quiet Hours</h3>
            <p className="text-xs text-text-secondary mb-2">
              No notifications during these hours (except urgent ones).
            </p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={prefs.quiet_hours_start || '23:00'}
                onChange={(e) => updatePrefs({ quiet_hours_start: e.target.value })}
                className="px-2 py-1 rounded-lg bg-surface-secondary text-sm text-text-primary border-0"
              />
              <span className="text-sm text-text-secondary">to</span>
              <input
                type="time"
                value={prefs.quiet_hours_end || '07:00'}
                onChange={(e) => updatePrefs({ quiet_hours_end: e.target.value })}
                className="px-2 py-1 rounded-lg bg-surface-secondary text-sm text-text-primary border-0"
              />
            </div>
          </Card>

          {/* Test button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={handleTestNotification}
            disabled={testSent}
          >
            {testSent ? 'Test Sent!' : 'Send Test Notification'}
          </Button>
        </>
      )}
    </div>
  )
}
