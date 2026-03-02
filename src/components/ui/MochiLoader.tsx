import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/animations'
import { MochiAvatar } from './MochiAvatar'

interface MochiLoaderProps {
  size?: number   // px, default 60
  text?: string
  className?: string
}

/**
 * Full-page or inline loading state with Mochi looking left-right.
 * Drop-in replacement for spinners throughout the app.
 */
export function MochiLoader({ size = 60, text, className }: MochiLoaderProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-8', className)}>
      <m.div
        animate={reducedMotion ? {} : { rotate: [-8, 8, -8] }}
        transition={reducedMotion ? { duration: 0 } : { duration: 1.5, ease: 'easeInOut', repeat: Infinity }}
        style={{ width: size, height: size }}
      >
        <MochiAvatar
          expression="curious"
          size="sm"
          enablePetting={false}
          className="w-full h-full"
        />
      </m.div>
      {text && (
        <p className="text-sm text-text-secondary">{text}</p>
      )}
    </div>
  )
}
