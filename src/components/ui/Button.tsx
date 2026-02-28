import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-white font-semibold',
    'shadow-[var(--shadow-button)]',
    'active:translate-y-1 active:scale-95',
    'active:shadow-[var(--shadow-button-active)]',
    'active:transition-all active:duration-100 active:ease-out',
  ].join(' '),
  secondary: [
    'bg-surface text-text-primary font-medium',
    'border-2 border-primary',
    'active:translate-y-0.5 active:scale-[0.97]',
  ].join(' '),
  ghost: [
    'bg-transparent text-primary font-medium',
    'hover:bg-primary/10',
    'active:scale-95',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-5 py-2 text-sm min-h-[36px]',
  md: 'px-7 py-3.5 text-base min-h-[44px]',
  lg: 'px-9 py-4 text-md min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'rounded-[var(--radius-pill)]',
          'transition-all duration-200 ease-[var(--ease-bouncy)]',
          'select-none cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
