import { useState, useRef, type ReactNode } from 'react'
import { m, useMotionValue, useTransform } from 'motion/react'
import { haptics } from '@/lib/animations'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

const PULL_THRESHOLD = 80

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  const pullDistance = useMotionValue(0)
  const mochiScale = useTransform(pullDistance, [0, PULL_THRESHOLD], [1, 1.4])
  const mochiY = useTransform(pullDistance, [0, PULL_THRESHOLD], [0, 16])
  const indicatorOpacity = useTransform(pullDistance, [0, 40], [0, 1])
  const indicatorY = useTransform(pullDistance, [0, 40, PULL_THRESHOLD], [-20, 0, 8])

  function handleTouchStart(e: React.TouchEvent) {
    if (isRefreshing) return
    startY.current = e.touches[0]?.clientY ?? 0
    pulling.current = true
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!pulling.current || isRefreshing) return
    const scrollTop = (e.currentTarget as HTMLElement).scrollTop
    if (scrollTop > 0) return

    const delta = (e.touches[0]?.clientY ?? 0) - startY.current
    if (delta > 0) {
      pullDistance.set(Math.min(delta * 0.5, PULL_THRESHOLD + 20))
      if (delta > 40) haptics.light()
    }
  }

  async function handleTouchEnd() {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance.get() >= PULL_THRESHOLD) {
      setIsRefreshing(true)
      haptics.medium()
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    pullDistance.set(0)
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehaviorY: 'contain' }}
    >
      {/* Pull indicator with Mochi */}
      <m.div
        className="flex justify-center overflow-hidden"
        style={{ opacity: indicatorOpacity, y: indicatorY, height: 48 }}
      >
        <m.img
          src={isRefreshing ? '/image/mochi-celebrate.png' : '/image/mochi-curious.png'}
          alt="Mochi"
          style={{ scale: mochiScale, y: mochiY }}
          animate={
            isRefreshing
              ? { rotate: [0, 360] }
              : { rotate: 0 }
          }
          transition={
            isRefreshing
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : { duration: 0.2 }
          }
          className="w-12 h-12 object-contain"
        />
      </m.div>

      {children}
    </div>
  )
}
