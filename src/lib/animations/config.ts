export const kawaiiEasing = [0.34, 1.56, 0.64, 1] as const

export const kawaiiSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
  mass: 0.8,
}

export const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
}

export const snappySpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 25,
}

export const pageTransitionSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
}

// Duration constants (seconds)
export const duration = {
  instant: 0.1,
  micro: 0.2,
  short: 0.3,
  medium: 0.4,
  long: 0.6,
  celebration: 0.8,
} as const
