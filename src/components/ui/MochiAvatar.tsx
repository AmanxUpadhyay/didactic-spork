import { cn } from '@/lib/cn'

export type MochiExpression =
  | 'idle'
  | 'face'
  | 'celebrate'
  | 'curious'
  | 'happy-bounce'
  | 'love'
  | 'sleep'
  | 'sparkle'
  | 'dance'
  | 'confused'
  | 'hatch'

const EXPRESSION_SRC: Record<MochiExpression, string> = {
  idle: '/image/mochi-idle.png',
  face: '/image/mochi-face.png',
  celebrate: '/image/mochi-celebrate.png',
  curious: '/image/mochi-curious.png',
  'happy-bounce': '/image/mochi-happy-bounce.png',
  love: '/image/mochi-love.png',
  sleep: '/image/mochi-sleep.png',
  sparkle: '/image/mochi-sparkle.png',
  dance: '/image/mochi-dance.png',
  confused: '/image/mochi-confused.png',
  hatch: '/image/mochi-hatch.png',
}

interface MochiAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  expression?: MochiExpression
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
 * Renders the Mochi mascot with configurable expression.
 * Defaults to 'idle' for backward compatibility.
 */
export function MochiAvatar({
  size = 'lg',
  expression = 'idle',
  className,
  alt = 'Mochi',
}: MochiAvatarProps) {
  return (
    <img
      src={EXPRESSION_SRC[expression]}
      alt={alt}
      className={cn('object-contain', sizes[size], className)}
      draggable={false}
    />
  )
}
