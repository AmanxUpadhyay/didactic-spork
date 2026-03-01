import { useInView } from 'motion/react'
import { useRef } from 'react'

export function useStaggerIn(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: threshold })
  return { ref, isInView }
}
