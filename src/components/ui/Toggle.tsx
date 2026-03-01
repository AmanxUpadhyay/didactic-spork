import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { haptics } from '@/lib/animations'

const toggleSpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
}

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onChange, label, disabled = false, className }: ToggleProps) {
  const handleClick = () => {
    if (disabled) return
    haptics.light()
    onChange(!checked)
  }

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <m.button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        animate={{
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          'relative flex items-center w-12 h-7 rounded-full px-1',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          checked ? 'justify-end' : 'justify-start',
        )}
      >
        <m.span
          layout
          transition={toggleSpring}
          className="block w-5 h-5 rounded-full bg-white shadow-sm pointer-events-none"
        />
      </m.button>
      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
    </label>
  )
}
