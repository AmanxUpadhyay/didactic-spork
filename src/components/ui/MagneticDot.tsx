import { m } from 'motion/react'
import { magneticSpring } from '@/lib/animations/config'

interface MagneticDotProps {
  isActive: boolean
  color?: string
  size?: number
  onActivate?: () => void
}

/**
 * A single indicator dot that morphs into a pill when active,
 * then snaps back to a circle when deactivated — with spring overshoot.
 */
export function MagneticDot({
  isActive,
  color = 'var(--color-primary)',
  size = 8,
  onActivate,
}: MagneticDotProps) {
  return (
    <m.div
      layout
      onClick={onActivate}
      animate={{
        width: isActive ? size * 2.5 : size,
        height: size,
        backgroundColor: isActive ? color : `color-mix(in srgb, ${color} 30%, transparent)`,
        scale: isActive ? 1 : 0.85,
      }}
      transition={magneticSpring}
      style={{
        borderRadius: size / 2,
        cursor: onActivate ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    />
  )
}
