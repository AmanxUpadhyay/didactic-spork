import { useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { expansionEase } from '@/lib/animations/config'

interface GeometricMaskProps {
  isTransitioning: boolean
  originX: number
  originY: number
  color: string
  onComplete: () => void
}

const CIRCLE_SIZE = 60 // px diameter of expanding circle

/**
 * Full-screen overlay that expands a circle from the tap origin,
 * covering the screen before the new tab content appears.
 */
export function GeometricMask({
  isTransitioning,
  originX,
  originY,
  color,
  onComplete,
}: GeometricMaskProps) {
  const completedRef = useRef(false)

  useEffect(() => {
    if (!isTransitioning) {
      completedRef.current = false
    }
  }, [isTransitioning])

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 390
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 844
  const coverRadius = Math.ceil(Math.hypot(screenW, screenH) / CIRCLE_SIZE) + 2

  return (
    <AnimatePresence>
      {isTransitioning && (
        <m.div
          key="geometric-mask"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }}
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        >
          <m.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: coverRadius,
              opacity: 1,
              transition: {
                scale: { duration: 0.28, ease: expansionEase as any },
              },
            }}
            onAnimationComplete={() => {
              if (!completedRef.current) {
                completedRef.current = true
                onComplete()
              }
            }}
            style={{
              position: 'absolute',
              left: originX,
              top: originY,
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: '50%',
              backgroundColor: color,
              translateX: '-50%',
              translateY: '-50%',
              transformOrigin: 'center center',
            }}
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}
