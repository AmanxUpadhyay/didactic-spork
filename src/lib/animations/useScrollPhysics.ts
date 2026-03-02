import { useRef, useCallback } from 'react'
import { useMotionValue, useReducedMotion } from 'motion/react'

interface CardTransform {
  rotateY: number
  rotateX: number
  scale: number
  opacity: number
}

const IDENTITY: CardTransform = { rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }

/**
 * Attaches to a scrollable container and computes 3D skew transforms for
 * each child element based on its distance from the container center.
 *
 * Returns a `getCardStyle(element)` function that computes the transform
 * values synchronously on scroll (no MotionValues per-card to avoid overhead).
 */
export function useScrollPhysics() {
  const containerRef = useRef<HTMLElement | null>(null)
  const prefersReduced = useReducedMotion()
  const scrollY = useMotionValue(0)

  const getCardStyle = useCallback(
    (el: HTMLElement): CardTransform => {
      if (prefersReduced || !containerRef.current) return IDENTITY

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const cardRect = el.getBoundingClientRect()

      const containerCenter = containerRect.top + containerRect.height / 2
      const cardCenter = cardRect.top + cardRect.height / 2

      const raw = (cardCenter - containerCenter) / (containerRect.height / 2)
      const normalized = Math.max(-1, Math.min(1, raw))
      const abs = Math.abs(normalized)

      const rotateY = normalized * 14
      const rotateX = normalized * -2
      const scale = 1 - abs * 0.08
      const opacity = 1 - abs * 0.4

      return { rotateY, rotateX, scale, opacity }
    },
    [prefersReduced],
  )

  return { containerRef, scrollY, getCardStyle }
}
