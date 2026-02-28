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

const MOOD_EMOJI: Record<string, string> = {
  cheerful: '✨',
  sarcastic: '😏',
  tough_love: '💪',
  empathetic: '💜',
  hype_man: '🔥',
  disappointed: '😔',
}

const SIZES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
}

export function KiraAvatar({ mood = 'cheerful', size = 'md', className = '' }: KiraAvatarProps) {
  return (
    <div
      className={`
        ${SIZES[size]}
        ${MOOD_COLORS[mood]}
        rounded-full ring-2 flex items-center justify-center
        font-accent font-bold
        ${className}
      `}
    >
      <span>{MOOD_EMOJI[mood]}</span>
    </div>
  )
}
