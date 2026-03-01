import type { Variants } from 'motion/react'
import { kawaiiSpring, gentleSpring, pageTransitionSpring } from './config'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: gentleSpring },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: gentleSpring },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: kawaiiSpring },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: pageTransitionSpring },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: pageTransitionSpring },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
}

export const staggerContainer = (delay = 0.08): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      delayChildren: 0.1,
    },
  },
})

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: kawaiiSpring },
}

export const cardEnter: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: kawaiiSpring },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

// Tab page transitions — direction-aware
export const pageEnterRight: Variants = {
  hidden: { opacity: 0, x: 50, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: pageTransitionSpring },
  exit: { opacity: 0, x: -30, scale: 0.98, transition: { duration: 0.2 } },
}

export const pageEnterLeft: Variants = {
  hidden: { opacity: 0, x: -50, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: pageTransitionSpring },
  exit: { opacity: 0, x: 30, scale: 0.98, transition: { duration: 0.2 } },
}
