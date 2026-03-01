import { useEffect, useState } from 'react'

interface BothWinCelebrationProps {
  show: boolean
  onDismiss: () => void
}

export function BothWinCelebration({ show, onDismiss }: BothWinCelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onDismiss])

  if (!show && !visible) return null

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onDismiss}
    >
      <div className="text-center animate-[slideUp_500ms_var(--ease-bouncy)]">
        <div className="text-6xl mb-3">🎉🏆🎉</div>
        <h2 className="text-2xl font-heading font-bold text-white">Both Win!</h2>
        <p className="text-white/80 text-sm mt-2">
          You both scored 85%+! Incredible teamwork.
        </p>
        <p className="text-white/60 text-xs mt-3">Tap to dismiss</p>
      </div>
    </div>
  )
}
