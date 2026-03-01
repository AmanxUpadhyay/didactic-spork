import { type InputHTMLAttributes, forwardRef, useState, useId, useRef, useEffect } from 'react'
import { m, useAnimation } from 'motion/react'
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
    const shakeControls = useAnimation()
    const prevError = useRef(error)

    // Shake when error first appears
    useEffect(() => {
      if (error && error !== prevError.current) {
        shakeControls.start({
          x: [-4, 4, -3, 3, -2, 2, -1, 1, 0],
          transition: { duration: 0.4, ease: 'easeInOut' },
        })
      }
      prevError.current = error
    }, [error, shakeControls])

    return (
      <m.div className="relative w-full" animate={shakeControls}>
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
        <m.div
          animate={{
            boxShadow: focused
              ? '0 0 0 4px color-mix(in srgb, var(--color-primary) 20%, transparent)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
          className="rounded-[var(--radius-input)]"
        >
          <input
            ref={ref}
            id={id}
            type={type}
            className={cn(
              'w-full rounded-[var(--radius-input)]',
              'border-2 bg-surface',
              'text-text-primary text-base',
              label ? 'px-4 pt-5 pb-2' : 'px-4 py-3.5',
              'transition-[border-color] duration-200 ease-out',
              'outline-none',
              'placeholder:text-text-secondary/50',
              error ? 'border-error' : focused ? 'border-primary' : 'border-border',
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
        </m.div>
        {error && (
          <p className="mt-1.5 ml-1 text-sm text-error">{error}</p>
        )}
      </m.div>
    )
  },
)

Input.displayName = 'Input'
