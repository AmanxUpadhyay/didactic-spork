import { useEffect, useRef } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface ConfettiCelebrationProps {
  show: boolean
  onComplete?: () => void
}

export function ConfettiCelebration({ show, onComplete }: ConfettiCelebrationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => {
        onComplete?.()
      }, 2500)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    >
      <DotLottieReact
        src="/animations/confetti.json"
        autoplay
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
