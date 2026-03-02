import { useState, useRef } from 'react'
import { m, AnimatePresence, type Transition } from 'motion/react'
import { cn } from '@/lib/cn'
import { useReducedMotion, haptics } from '@/lib/animations'
import { sounds } from '@/lib/sounds'

export type MochiExpression =
  | 'idle'
  | 'face'
  | 'celebrate'
  | 'curious'
  | 'happy-bounce'
  | 'love'
  | 'sleep'
  | 'sparkle'
  | 'dance'
  | 'confused'
  | 'hatch'

const EXPRESSION_SRC: Record<MochiExpression, string> = {
  idle: '/image/mochi-idle.png',
  face: '/image/mochi-face.png',
  celebrate: '/image/mochi-celebrate.png',
  curious: '/image/mochi-curious.png',
  'happy-bounce': '/image/mochi-happy-bounce.png',
  love: '/image/mochi-love.png',
  sleep: '/image/mochi-sleep.png',
  sparkle: '/image/mochi-sparkle.png',
  dance: '/image/mochi-dance.png',
  confused: '/image/mochi-confused.png',
  hatch: '/image/mochi-hatch.png',
}

interface ExpressionAnim {
  values: { y?: number[]; scale?: number[]; rotate?: number[] }
  transition: Transition
}

const EXPRESSION_ANIMATIONS: Record<MochiExpression, ExpressionAnim> = {
  idle:           { values: { y: [0, -5, 0] },                          transition: { duration: 3,   ease: 'easeInOut', repeat: Infinity } },
  face:           { values: { scale: [1, 1.05, 1] },                    transition: { duration: 2,   ease: 'easeInOut', repeat: Infinity } },
  celebrate:      { values: { y: [0, -12, 0], scale: [1, 1.1, 1] },    transition: { duration: 0.8, ease: 'easeInOut', repeat: Infinity } },
  curious:        { values: { rotate: [-3, 3, -3] },                    transition: { duration: 2,   ease: 'easeInOut', repeat: Infinity } },
  'happy-bounce': { values: { y: [0, -8, 0] },                          transition: { duration: 1.5, ease: 'easeInOut', repeat: Infinity } },
  love:           { values: { y: [0, -6, 0], scale: [1, 1.05, 1] },    transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity } },
  sleep:          { values: { y: [0, -2, 0] },                          transition: { duration: 4,   ease: 'easeInOut', repeat: Infinity } },
  sparkle:        { values: { y: [0, -10, 0] },                         transition: { duration: 1,   ease: 'easeInOut', repeat: Infinity } },
  dance:          { values: { rotate: [-8, 8, -8], scale: [1, 1.08, 1] }, transition: { duration: 0.6, ease: 'easeInOut', repeat: Infinity } },
  confused:       { values: { rotate: [-5, 5, -5] },                    transition: { duration: 2,   ease: 'easeInOut', repeat: Infinity } },
  hatch:          { values: { scale: [0.95, 1.1, 1] },                  transition: { duration: 1,   ease: 'easeInOut', repeat: Infinity } },
}

interface MochiAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  expression?: MochiExpression
  enablePetting?: boolean
  className?: string
  alt?: string
}

const sizes = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

interface Heart {
  id: number
  x: number
  y: number
}

/**
 * Renders the Mochi mascot with expression-specific Motion animations.
 * Tap to pet for heart particles (enablePetting=true by default).
 */
export function MochiAvatar({
  size = 'lg',
  expression = 'idle',
  enablePetting = true,
  className,
  alt = 'Mochi',
}: MochiAvatarProps) {
  const reducedMotion = useReducedMotion()
  const [hearts, setHearts] = useState<Heart[]>([])
  const heartIdRef = useRef(0)

  const anim = EXPRESSION_ANIMATIONS[expression]

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    if (!enablePetting) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const newHearts: Heart[] = Array.from({ length: 3 }, (_, i) => ({
      id: ++heartIdRef.current,
      x: cx + (i - 1) * 14,
      y: cy - 8,
    }))
    setHearts((prev) => [...prev, ...newHearts])
    haptics.light()
    sounds.softPop()
  }

  function removeHeart(id: number) {
    setHearts((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div
      className={cn('relative inline-block', enablePetting && 'cursor-pointer select-none', className)}
      onClick={handleTap}
    >
      {/* Continuous loop animation wrapper */}
      <m.div
        animate={reducedMotion ? {} : anim.values}
        transition={reducedMotion ? { duration: 0 } : anim.transition}
      >
        {/* Expression crossfade */}
        <AnimatePresence mode="wait">
          <m.img
            key={expression}
            src={EXPRESSION_SRC[expression]}
            alt={alt}
            className={cn('object-contain', sizes[size])}
            draggable={false}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
      </m.div>

      {/* Tap-to-pet hearts */}
      <AnimatePresence>
        {hearts.map((heart) => (
          <m.span
            key={heart.id}
            className="absolute pointer-events-none text-base select-none"
            style={{ left: heart.x, top: heart.y }}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -55, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            onAnimationComplete={() => removeHeart(heart.id)}
          >
            ❤️
          </m.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
