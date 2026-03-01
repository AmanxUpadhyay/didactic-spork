import { useEffect, useState } from 'react'
import { Card } from '@/components/ui'

interface InAppNotificationToastProps {
  notification: { title: string; body: string; category: string } | null
  onDismiss: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  partner_activity: '🤝',
  streak_warning: '🔥',
  sprint_results: '🏆',
  celebration: '🎉',
  mood_checkin: '💭',
  morning_briefing: '☀️',
  nudge: '👋',
  task_deadline: '⏰',
  sprint_start: '🚀',
}

export function InAppNotificationToast({ notification, onDismiss }: InAppNotificationToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300) // Wait for exit animation
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification, onDismiss])

  if (!notification) return null

  const icon = CATEGORY_ICONS[notification.category] || '🔔'

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[70] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <Card className="!bg-surface shadow-lg border border-primary/10 cursor-pointer" onClick={onDismiss}>
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{notification.title}</p>
            <p className="text-xs text-text-secondary line-clamp-2">{notification.body}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
