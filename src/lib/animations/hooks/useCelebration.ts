import { useCallback } from 'react'
import { haptics } from '../haptics'
import { useReducedMotion } from './useReducedMotion'

export type CelebrationIntensity = 'micro' | 'small' | 'medium' | 'large' | 'epic'

// Read palette colors from CSS vars at runtime
function getPaletteColors(isDark: boolean): string[] {
  const style = getComputedStyle(document.documentElement)
  const primary = style.getPropertyValue('--color-primary').trim() || '#E8878F'
  const secondary = style.getPropertyValue('--color-secondary').trim() || '#F2B8A2'
  const accent = style.getPropertyValue('--color-accent').trim() || '#C4706E'
  return isDark
    ? [primary, secondary, accent, '#FFFFFF', '#E0F0E8']
    : [primary, secondary, accent, '#FFFFFF', '#FFE4EC']
}

export function useCelebration() {
  const reducedMotion = useReducedMotion()

  const celebrate = useCallback(async (intensity: CelebrationIntensity) => {
    if (reducedMotion) return

    const confetti = (await import('canvas-confetti')).default
    const isDark = document.documentElement.classList.contains('dark')
    const colors = getPaletteColors(isDark)

    switch (intensity) {
      case 'micro':
        // handled by AnimatedCheckbox locally
        break
      case 'small':
        haptics.success()
        confetti({ particleCount: 30, spread: 60, colors, origin: { y: 0.6 } })
        break
      case 'medium':
        haptics.success()
        confetti({ particleCount: 80, spread: 90, colors, origin: { y: 0.6 } })
        break
      case 'large':
        haptics.celebration()
        confetti({ particleCount: 60, spread: 70, colors, origin: { y: 0.6 }, angle: 60 })
        confetti({ particleCount: 60, spread: 70, colors, origin: { y: 0.6 }, angle: 120 })
        break
      case 'epic': {
        haptics.celebration()
        const end = Date.now() + 3000
        const frame = () => {
          confetti({ particleCount: 5, angle: 60, spread: 55, colors, origin: { x: 0 } })
          confetti({ particleCount: 5, angle: 120, spread: 55, colors, origin: { x: 1 } })
          if (Date.now() < end) requestAnimationFrame(frame)
        }
        frame()
        break
      }
    }
  }, [reducedMotion])

  return { celebrate }
}
