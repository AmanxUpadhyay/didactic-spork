import { type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, BodyPartMuscleIcon, HeartCheckIcon, FireIcon, Sad01Icon, NeutralIcon } from '@hugeicons/core-free-icons'

interface KiraAvatarProps {
  mood?: 'cheerful' | 'sarcastic' | 'tough_love' | 'empathetic' | 'hype_man' | 'disappointed'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const MOOD_COLORS: Record<string, string> = {
  cheerful: 'bg-primary/20 ring-primary/40',
  sarcastic: 'bg-amber-100 ring-amber-300',
  tough_love: 'bg-rose-100 ring-rose-300',
  empathetic: 'bg-violet-100 ring-violet-300',
  hype_man: 'bg-emerald-100 ring-emerald-300',
  disappointed: 'bg-slate-100 ring-slate-300',
}

function getMoodIcon(mood: string, iconSize: number): ReactNode {
  switch (mood) {
    case 'cheerful':     return <HugeiconsIcon icon={SparklesIcon} size={iconSize} />
    case 'sarcastic':    return <HugeiconsIcon icon={NeutralIcon} size={iconSize} />
    case 'tough_love':   return <HugeiconsIcon icon={BodyPartMuscleIcon} size={iconSize} />
    case 'empathetic':   return <HugeiconsIcon icon={HeartCheckIcon} size={iconSize} className="text-violet-500" />
    case 'hype_man':     return <HugeiconsIcon icon={FireIcon} size={iconSize} className="text-emerald-600" />
    case 'disappointed': return <HugeiconsIcon icon={Sad01Icon} size={iconSize} />
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
