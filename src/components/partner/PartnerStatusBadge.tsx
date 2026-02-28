import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

interface PartnerStatusBadgeProps {
  partnerId: string | null
  userId: string
}

export function PartnerStatusBadge({ partnerId, userId }: PartnerStatusBadgeProps) {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    if (!partnerId || !userId) return

    const channel = supabase.channel('online-status', {
      config: { presence: { key: userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setIsOnline(!!state[partnerId])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [partnerId, userId])

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          'w-2.5 h-2.5 rounded-full',
          'transition-colors duration-300',
          isOnline ? 'bg-success' : 'bg-border',
        )}
      />
      <span className="text-xs text-text-secondary">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </span>
  )
}
