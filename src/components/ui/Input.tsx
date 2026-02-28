import { type InputHTMLAttributes, forwardRef, useState, useId } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id: idProp, type = 'text', ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const [focused, setFocused] = useState(false)
    const hasValue = props.value !== undefined && props.value !== ''

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'absolute left-4 transition-all duration-200 ease-out pointer-events-none',
              'text-text-secondary',
              focused || hasValue
                ? 'top-1.5 text-xs text-primary font-medium'
                : 'top-3.5 text-base',
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'w-full rounded-[var(--radius-input)]',
            'border-2 border-border bg-surface',
            'text-text-primary text-base',
            label ? 'px-4 pt-5 pb-2' : 'px-4 py-3.5',
            'transition-[border-color,box-shadow] duration-200 ease-out',
            'outline-none',
            'focus:border-primary focus:shadow-[var(--shadow-focus)]',
            'placeholder:text-text-secondary/50',
            error && 'border-error animate-[head-shake_400ms_ease]',
            className,
          )}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 ml-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
