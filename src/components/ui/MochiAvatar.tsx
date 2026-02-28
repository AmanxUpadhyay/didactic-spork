import { cn } from '@/lib/cn'

interface MochiAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  alt?: string
}

const sizes = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

/**
 * Renders the Mochi mascot (idle expression only).
 */
export function MochiAvatar({ size = 'lg', className, alt = 'Mochi' }: MochiAvatarProps) {
  return (
    <img
      src="/image/mochi-idle.png"
      alt={alt}
      className={cn('object-contain', sizes[size], className)}
      draggable={false}
    />
  )
}
