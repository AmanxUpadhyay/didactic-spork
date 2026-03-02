import { type InputHTMLAttributes, forwardRef, useState, useId, useRef, useEffect } from 'react'
import { m, useAnimation } from 'motion/react'
import { cn } from '@/lib/cn'
import { kawaiiSpring } from '@/lib/animations/config'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id: idProp, type = 'text', ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const shakeControls = useAnimation()
    const prevError = useRef(error)
    const isPassword = type === 'password'

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
          <m.label
            htmlFor={id}
            className="absolute left-4 pointer-events-none z-10"
            style={{ top: '6px', fontSize: '12px' }}
            animate={
              focused
                ? { color: 'var(--color-primary)', fontWeight: '500' }
                : { color: 'var(--color-text-secondary)', fontWeight: '400' }
            }
            transition={kawaiiSpring}
          >
            {label}
          </m.label>
        )}
        <m.div
          animate={{
            boxShadow: focused
              ? '0 0 0 4px color-mix(in srgb, var(--color-primary) 20%, transparent)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
          className="rounded-[var(--radius-input)] relative"
        >
          <input
            ref={ref}
            id={id}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'w-full rounded-[var(--radius-input)]',
              'border-2 bg-surface',
              'text-text-primary text-base',
              label ? 'px-4 pt-5 pb-2' : 'px-4 py-3.5',
              isPassword && 'pr-10',
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
          {isPassword && (
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                // Eye-off icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                // Eye icon
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </m.div>
        {error && (
          <p className="mt-1.5 ml-1 text-sm text-error">{error}</p>
        )}
      </m.div>
    )
  },
)

Input.displayName = 'Input'
