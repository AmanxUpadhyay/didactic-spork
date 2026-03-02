import { useRef, useEffect, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useScrollPhysics } from '@/lib/animations/useScrollPhysics'

interface ScrollPhysicsContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Wraps a list of children with a 3D perspective container.
 * On scroll, each direct child receives a skew/scale/opacity transform
 * based on its distance from the center of the visible area.
 */
export function ScrollPhysicsContainer({ children, className }: ScrollPhysicsContainerProps) {
  const { containerRef, getCardStyle } = useScrollPhysics()
  const childRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const rafRef = useRef<number | null>(null)

  const updateTransforms = useCallback(() => {
    childRefs.current.forEach((el) => {
      const style = getCardStyle(el)
      el.style.transform = `rotateY(${style.rotateY}deg) rotateX(${style.rotateX}deg) scale(${style.scale})`
      el.style.opacity = String(style.opacity)
    })
  }, [getCardStyle])

  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      updateTransforms()
      rafRef.current = null
    })
  }, [updateTransforms])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', onScroll, { passive: true })
    // Run once on mount to set initial state
    updateTransforms()
    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [onScroll, updateTransforms, containerRef])

  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div
      ref={(el) => { containerRef.current = el }}
      className={cn('overflow-y-auto', className)}
      style={{ perspective: '800px', perspectiveOrigin: 'center center' }}
    >
      {childArray.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) childRefs.current.set(i, el)
            else childRefs.current.delete(i)
          }}
          style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
