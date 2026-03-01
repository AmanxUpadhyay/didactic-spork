import { useEffect, useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Exchange01Icon, FireIcon, Award01Icon, PartyIcon,
  BubbleChatNotificationIcon, Sun01Icon, Notification01Icon,
  AlarmClockIcon, Rocket01Icon,
} from '@hugeicons/core-free-icons'
import { Card } from '@/components/ui'

interface InAppNotificationToastProps {
  notification: { title: string; body: string; category: string } | null
  onDismiss: () => void
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
  partner_activity: <HugeiconsIcon icon={Exchange01Icon} size={18} />,
  streak_warning:   <HugeiconsIcon icon={FireIcon} size={18} />,
  sprint_results:   <HugeiconsIcon icon={Award01Icon} size={18} />,
  celebration:      <HugeiconsIcon icon={PartyIcon} size={18} />,
  mood_checkin:     <HugeiconsIcon icon={BubbleChatNotificationIcon} size={18} />,
  morning_briefing: <HugeiconsIcon icon={Sun01Icon} size={18} />,
  nudge:            <HugeiconsIcon icon={Notification01Icon} size={18} />,
  task_deadline:    <HugeiconsIcon icon={AlarmClockIcon} size={18} />,
  sprint_start:     <HugeiconsIcon icon={Rocket01Icon} size={18} />,
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

  const icon = CATEGORY_ICONS[notification.category] ?? <HugeiconsIcon icon={Notification01Icon} size={18} />

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[70] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <Card className="!bg-surface shadow-lg border border-primary/10 cursor-pointer" onClick={onDismiss}>
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{notification.title}</p>
            <p className="text-xs text-text-secondary line-clamp-2">{notification.body}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
