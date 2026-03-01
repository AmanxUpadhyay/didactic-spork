import { m, useAnimation } from 'motion/react'
import { kawaiiSpring, useCelebration } from '@/lib/animations'

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: number
  disabled?: boolean
}

export function AnimatedCheckbox({ checked, onChange, size = 24, disabled = false }: AnimatedCheckboxProps) {
  const { celebrate } = useCelebration()
  const controls = useAnimation()

  const handleChange = async () => {
    if (disabled) return
    const newChecked = !checked
    onChange(newChecked)
    if (newChecked) {
      await controls.start({ scale: [1, 1.15, 1], transition: kawaiiSpring })
      celebrate('small')
    }
  }

  return (
    <m.button
      onClick={handleChange}
      animate={controls}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      disabled={disabled}
      type="button"
      aria-checked={checked}
      role="checkbox"
    >
      <m.div
        className="rounded-full border-2 flex items-center justify-center"
        animate={{
          backgroundColor: checked ? 'var(--color-success, #4ade80)' : 'transparent',
          borderColor: checked ? 'var(--color-success, #4ade80)' : 'var(--color-primary)',
          scale: checked ? [1, 1.12, 1] : 1,
        }}
        transition={kawaiiSpring}
        style={{ width: size, height: size }}
      >
        {checked && (
          <svg
            viewBox="0 0 12 10"
            fill="none"
            width={size * 0.5}
            height={size * 0.42}
            style={{ overflow: 'visible' }}
          >
            <m.path
              d="M1 5L4.5 8.5L11 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </svg>
        )}
      </m.div>
    </m.button>
  )
}
