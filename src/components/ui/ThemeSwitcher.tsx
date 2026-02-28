import { cn } from '@/lib/cn'
import { useTheme, THEMES, type Theme } from '@/hooks/useTheme'

const themeConfig: Record<Theme, { label: string; swatch: string; textColor: string }> = {
  'strawberry-milk': { label: 'Strawberry', swatch: '#E8878F', textColor: '#3D2C2E' },
  'strawberry-milk-dark': { label: 'Strawberry Dark', swatch: '#D4868E', textColor: '#F2E6E0' },
  'matcha-latte': { label: 'Matcha', swatch: '#8BBF9F', textColor: '#2D3B30' },
  'matcha-latte-dark': { label: 'Matcha Dark', swatch: '#82B096', textColor: '#EDE8DF' },
  'honey-biscuit': { label: 'Honey', swatch: '#E8B84B', textColor: '#3A2D20' },
  'honey-biscuit-dark': { label: 'Honey Dark', swatch: '#D0A040', textColor: '#F0E8D8' },
}

interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme: currentTheme, setTheme } = useTheme()

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {THEMES.map((t) => {
        const config = themeConfig[t]
        const isActive = currentTheme === t
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              'flex items-center gap-2 px-3 py-2',
              'rounded-[var(--radius-pill)]',
              'border-2 transition-all duration-200 ease-[var(--ease-bouncy)]',
              'text-sm font-medium',
              isActive
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-border bg-surface hover:border-primary/40',
            )}
          >
            <span
              className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
              style={{ backgroundColor: config.swatch }}
            />
            <span className="text-text-primary">{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
