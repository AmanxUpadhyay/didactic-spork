import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui'

const DISMISS_KEY = 'jugalbandi_install_dismissed'
const VISIT_KEY = 'jugalbandi_visit_count'

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !('standalone' in navigator && (navigator as any).standalone)
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
}

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) return

    // Check dismiss
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) return

    // Track visits
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1
    localStorage.setItem(VISIT_KEY, String(visits))

    // Show on first visit or after 3 visits
    if (visits !== 1 && visits < 3) return

    if (isIOS()) {
      setIsIOSDevice(true)
      setShow(true)
      return
    }

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    function handlePrompt(e: Event) {
      e.preventDefault()
      deferredPromptRef.current = e
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setShow(false)
  }

  async function handleInstall() {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt()
      const result = await deferredPromptRef.current.userChoice
      if (result.outcome === 'accepted') {
        setShow(false)
      }
      deferredPromptRef.current = null
    }
  }

  if (!show) return null

  return (
    <div className="px-5 mb-4 animate-[slideUp_300ms_var(--ease-bouncy)]">
      <Card className="!bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0" role="img" aria-label="install">
            📲
          </span>
          <div className="flex-1 min-w-0">
            {isIOSDevice ? (
              <>
                <p className="text-sm font-medium text-text-primary">Add to Home Screen</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Tap the share button, then "Add to Home Screen" for the best experience.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-text-primary">Install Jugalbandi</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Get quick access from your home screen.
                </p>
                <button
                  onClick={handleInstall}
                  className="mt-2 px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-[var(--radius-pill)] active:scale-[0.97] transition-transform"
                >
                  Install
                </button>
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
