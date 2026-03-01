import { useEffect, useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, DiamondIcon, SnowIcon, EyeIcon, GiftIcon } from '@hugeicons/core-free-icons'

const REWARD_DISPLAY: Record<string, { icon: ReactNode; label: string; color: string }> = {
  '2x_points':     { icon: <HugeiconsIcon icon={SparklesIcon} size={64} />, label: '2x Points!', color: 'text-yellow-500' },
  '3x_points':     { icon: <HugeiconsIcon icon={DiamondIcon} size={64} />, label: '3x Points!', color: 'text-purple-500' },
  'streak_freeze': { icon: <HugeiconsIcon icon={SnowIcon} size={64} />, label: 'Streak Freeze!', color: 'text-blue-500' },
  'spy_peek':      { icon: <HugeiconsIcon icon={EyeIcon} size={64} />, label: 'Spy Peek!', color: 'text-green-500' },
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

  const display = REWARD_DISPLAY[reward.type] || { icon: <HugeiconsIcon icon={GiftIcon} size={64} />, label: reward.type, color: 'text-primary' }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onDismiss}>
      <div className={`text-center transition-all duration-500 ${phase === 'shake' ? 'animate-bounce' : 'scale-110'}`}>
        <div className="flex justify-center mb-4 text-white">
          {phase === 'shake' ? <HugeiconsIcon icon={GiftIcon} size={64} /> : display.icon}
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
