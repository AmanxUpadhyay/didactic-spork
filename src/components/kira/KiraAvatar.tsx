import { type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, BodyPartMuscleIcon, HeartCheckIcon, FireIcon, Sad01Icon, NeutralIcon } from '@hugeicons/core-free-icons'

interface KiraAvatarProps {
  mood?: 'cheerful' | 'sarcastic' | 'tough_love' | 'empathetic' | 'hype_man' | 'disappointed'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const MOOD_COLORS: Record<string, string> = {
  cheerful:    'bg-primary/20 ring-primary/40',
  sarcastic:   'bg-warning/15 ring-warning/30',
  tough_love:  'bg-error/15 ring-error/25',
  empathetic:  'bg-primary/10 ring-primary/20',
  hype_man:    'bg-success/15 ring-success/25',
  disappointed:'bg-border/60 ring-border',
}

function getMoodIcon(mood: string, iconSize: number): ReactNode {
  switch (mood) {
    case 'cheerful':     return <HugeiconsIcon icon={SparklesIcon} size={iconSize} />
    case 'sarcastic':    return <HugeiconsIcon icon={NeutralIcon} size={iconSize} className="text-warning" />
    case 'tough_love':   return <HugeiconsIcon icon={BodyPartMuscleIcon} size={iconSize} className="text-error" />
    case 'empathetic':   return <HugeiconsIcon icon={HeartCheckIcon} size={iconSize} className="text-primary" />
    case 'hype_man':     return <HugeiconsIcon icon={FireIcon} size={iconSize} className="text-success" />
    case 'disappointed': return <HugeiconsIcon icon={Sad01Icon} size={iconSize} className="text-text-secondary" />
    default:             return <HugeiconsIcon icon={SparklesIcon} size={iconSize} />
  }
}

const SIZES = {
  sm: { cls: 'w-8 h-8', iconSize: 14 },
  md: { cls: 'w-10 h-10', iconSize: 18 },
  lg: { cls: 'w-14 h-14', iconSize: 24 },
}

export function KiraAvatar({ mood = 'cheerful', size = 'md', className = '' }: KiraAvatarProps) {
  const { cls, iconSize } = SIZES[size]
  return (
    <div
      className={`
        ${cls}
        ${MOOD_COLORS[mood]}
        rounded-full ring-2 flex items-center justify-center
        font-accent font-bold
        ${className}
      `}
    >
      {getMoodIcon(mood, iconSize)}
    </div>
  )
}
