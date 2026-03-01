import { type ReactNode } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { MochiAvatar } from './MochiAvatar'
import { kawaiiSpring, gentleSpring } from '@/lib/animations'

type EmptyStateVariant = 'no-data' | 'all-done'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  children?: ReactNode
  className?: string
}

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  const isAllDone = variant === 'all-done'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 px-6 text-center',
        className,
      )}
    >
      <div className="relative">
        {isAllDone ? (
          <>
            {/* Floating Mochi with celebrate expression */}
            <m.img
              src="/image/mochi-celebrate.png"
              alt="Mochi celebrating"
              className="w-24 h-24 object-contain"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Floating hearts staggered */}
            {[0, 1, 2].map((i) => (
              <m.span
                key={i}
                className="absolute text-xl pointer-events-none"
                style={{
                  left: `${20 + i * 28}%`,
                  bottom: '60%',
                }}
                animate={{
                  y: [-20, -65],
                  opacity: [1, 0],
                  scale: [0.5, 1.2],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              >
                ❤️
              </m.span>
            ))}
          </>
        ) : (
          <MochiAvatar
            size="xl"
            alt="Mochi sleeping"
            className="opacity-60 grayscale-[30%]"
          />
        )}
      </div>

      <m.div
        className="space-y-1.5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={gentleSpring}
      >
        <m.h3
          className="text-lg font-heading font-semibold text-text-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...kawaiiSpring, delay: 0.1 }}
        >
          {title}
        </m.h3>
        {description && (
          <p className="text-sm text-text-secondary max-w-[260px]">
            {description}
          </p>
        )}
      </m.div>

      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
