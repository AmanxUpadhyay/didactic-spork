import { useState } from 'react'
import { m } from 'motion/react'
import { kawaiiSpring } from '@/lib/animations'
import { cn } from '@/lib/cn'

interface MochiMoodStripProps {
  progress: number   // 0 to 1
  remaining: number  // count of remaining habits
  onMicroCelebrate?: () => void
  className?: string
}

function getMochiConfig(progress: number, remaining: number): { src: string; message: string } {
  if (progress === 0) {
    return { src: '/image/mochi-sleep.png', message: 'Ready when you are 🌙' }
  }
  if (progress < 0.5) {
    return { src: '/image/mochi-curious.png', message: `Keep going! ${remaining} left` }
  }
  if (progress < 1) {
    return { src: '/image/mochi-happy-bounce.png', message: 'Almost there! 🔥' }
  }
  return { src: '/image/mochi-celebrate.png', message: 'Amazing! 🎉' }
}

export function MochiMoodStrip({ progress, remaining, onMicroCelebrate, className }: MochiMoodStripProps) {
  const [dancing, setDancing] = useState(false)
  const { src, message } = getMochiConfig(progress, remaining)

  function handleTap() {
    setDancing(true)
    onMicroCelebrate?.()
    setTimeout(() => setDancing(false), 800)
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Mochi */}
      <m.img
        src={dancing ? '/image/mochi-dance.png' : src}
        alt="Mochi"
        className="w-16 h-16 object-cover object-[center_top] shrink-0 cursor-pointer"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleTap}
        whileTap={{ scale: 0.85, transition: kawaiiSpring }}
      />

      {/* Speech bubble */}
      <div className="bg-surface border border-border rounded-xl px-3 py-2 text-sm font-medium text-text-primary relative">
        {/* Tail — border layer */}
        <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0
          border-t-[6px] border-t-transparent
          border-r-[6px] border-r-border
          border-b-[6px] border-b-transparent" />
        {/* Tail — fill layer */}
        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-0 h-0
          border-t-[5px] border-t-transparent
          border-r-[5px] border-r-surface
          border-b-[5px] border-b-transparent" />
        {message}
      </div>
    </div>
  )
}
