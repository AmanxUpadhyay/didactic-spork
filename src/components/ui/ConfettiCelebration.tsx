import { useEffect, useRef } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useCelebration, type CelebrationIntensity } from '@/lib/animations'

interface ConfettiCelebrationProps {
  show: boolean
  onComplete?: () => void
  intensity?: CelebrationIntensity
}

export function ConfettiCelebration({ show, onComplete, intensity = 'medium' }: ConfettiCelebrationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { celebrate } = useCelebration()

  useEffect(() => {
    if (show) {
      // Fire palette-aware canvas-confetti
      celebrate(intensity)
      timerRef.current = setTimeout(() => {
        onComplete?.()
      }, 2500)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [show, onComplete, celebrate, intensity])

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
