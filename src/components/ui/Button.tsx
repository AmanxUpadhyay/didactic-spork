import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring, haptics } from '@/lib/animations'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-text-primary font-semibold',
    'shadow-[var(--shadow-button)] active:shadow-[var(--shadow-button-active)]',
  ].join(' '),
  secondary: [
    'bg-surface text-text-primary font-medium',
    'border-2 border-primary',
  ].join(' '),
  ghost: [
    'bg-transparent text-primary font-medium',
    'hover:bg-primary/10',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-5 py-2 text-sm min-h-[36px]',
  md: 'px-7 py-3.5 text-base min-h-[44px]',
  lg: 'px-9 py-4 text-md min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, isLoading, children, onPointerDown, ...props }, ref) => {
    const effectiveDisabled = disabled || isLoading
    return (
      <m.button
        ref={ref}
        whileTap={effectiveDisabled ? undefined : { scale: 0.85, y: variant === 'primary' ? 2 : 0 }}
        whileHover={effectiveDisabled ? undefined : { scale: 1.05 }}
        transition={kawaiiSpring}
        onPointerDown={(e) => {
          if (!effectiveDisabled) haptics.light()
          onPointerDown?.(e as React.PointerEvent<HTMLButtonElement>)
        }}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'rounded-[var(--radius-pill)]',
          'select-none cursor-pointer',
          'disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={effectiveDisabled}
        {...(props as object)}
      >
        {isLoading && (
          <svg className="animate-spin shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
        {children}
      </m.button>
    )
  },
)

Button.displayName = 'Button'
