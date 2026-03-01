import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'

interface AnimationProviderProps {
  children: React.ReactNode
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
