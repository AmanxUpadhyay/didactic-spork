import { useEffect, useState } from 'react'

const REWARD_DISPLAY: Record<string, { emoji: string; label: string; color: string }> = {
  '2x_points': { emoji: '✨', label: '2x Points!', color: 'text-yellow-500' },
  '3x_points': { emoji: '💎', label: '3x Points!', color: 'text-purple-500' },
  'streak_freeze': { emoji: '🧊', label: 'Streak Freeze!', color: 'text-blue-500' },
  'spy_peek': { emoji: '👀', label: 'Spy Peek!', color: 'text-green-500' },
}

interface MysteryBoxRevealProps {
  reward: { type: string } | null
  onDismiss: () => void
}

export function MysteryBoxReveal({ reward, onDismiss }: MysteryBoxRevealProps) {
  const [phase, setPhase] = useState<'shake' | 'reveal' | 'done'>('shake')

  useEffect(() => {
    if (!reward) return
    const t1 = setTimeout(() => setPhase('reveal'), 1000)
    const t2 = setTimeout(() => setPhase('done'), 3500)
    const t3 = setTimeout(onDismiss, 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [reward, onDismiss])

  if (!reward) return null

  const display = REWARD_DISPLAY[reward.type] || { emoji: '🎁', label: reward.type, color: 'text-primary' }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onDismiss}>
      <div className={`text-center transition-all duration-500 ${phase === 'shake' ? 'animate-bounce' : 'scale-110'}`}>
        <div className="text-7xl mb-4">
          {phase === 'shake' ? '🎁' : display.emoji}
        </div>
        {phase !== 'shake' && (
          <div className="animate-[slideUp_300ms_var(--ease-bouncy)]">
            <p className={`text-2xl font-heading font-bold ${display.color}`}>
              {display.label}
            </p>
            <p className="text-sm text-white/80 mt-1">Mystery box reward!</p>
          </div>
        )}
      </div>
    </div>
  )
}
