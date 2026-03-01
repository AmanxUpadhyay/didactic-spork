import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'

const OPT_IN_DISMISSED_KEY = 'jugalbandi_notif_optin_dismissed'
const FIRST_USE_KEY = 'jugalbandi_first_use'

export function NotificationOptIn() {
  const { permission, isSupported, iosNeedsInstall, requestPermission, loading } = useNotificationPermission()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isSupported || permission === 'granted' || permission === 'denied') return
    if (localStorage.getItem(OPT_IN_DISMISSED_KEY)) return

    // Track first use
    const firstUse = localStorage.getItem(FIRST_USE_KEY)
    if (!firstUse) {
      localStorage.setItem(FIRST_USE_KEY, new Date().toISOString())
      return // Don't show on first day
    }

    // Show after 24h of first use
    const elapsed = Date.now() - new Date(firstUse).getTime()
    if (elapsed > 24 * 60 * 60 * 1000) {
      setShow(true)
    }
  }, [isSupported, permission])

  if (!show) return null

  function handleDismiss() {
    localStorage.setItem(OPT_IN_DISMISSED_KEY, '1')
    setShow(false)
  }

  async function handleEnable() {
    const granted = await requestPermission()
    if (granted) setShow(false)
  }

  return (
    <div className="px-5 mb-4 animate-[slideUp_300ms_var(--ease-bouncy)]">
      <Card className="!bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🔔</span>
          <div className="flex-1 min-w-0">
            {iosNeedsInstall ? (
              <>
                <p className="text-sm font-medium text-text-primary">Enable Notifications</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  First, add Jugalbandi to your Home Screen, then enable notifications.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-text-primary">Stay in the loop!</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Get streak warnings, partner updates, and sprint results. Kira promises not to spam.
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={handleEnable}
                  disabled={loading}
                >
                  {loading ? 'Enabling...' : 'Enable Notifications'}
                </Button>
              </>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-text-secondary hover:text-text-primary text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      </Card>
    </div>
  )
}
