import { useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'

export function useAnimatedCounter(value: number, _duration = 0.6) {
  const spring = useSpring(value, { stiffness: 200, damping: 30 })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())
  return display
}
