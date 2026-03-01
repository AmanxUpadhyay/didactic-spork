import { type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Exchange01Icon, FireIcon, Award01Icon, PartyIcon,
  BubbleChatNotificationIcon, Sun01Icon, Notification01Icon,
  AlarmClockIcon, Rocket01Icon,
} from '@hugeicons/core-free-icons'
import { Card } from '@/components/ui'

interface Notification {
  id: string
  title: string
  body: string
  category: string
  created_at: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAllRead: () => void
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationCenter({ notifications, onMarkAllRead }: NotificationCenterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-primary font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-8">No notifications yet</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {notifications.map((n) => (
            <Card key={n.id} className="!py-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5">{CATEGORY_ICONS[n.category] ?? <HugeiconsIcon icon={Notification01Icon} size={18} />}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-secondary line-clamp-2">{n.body}</p>
                  <p className="text-xs text-text-secondary/60 mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
