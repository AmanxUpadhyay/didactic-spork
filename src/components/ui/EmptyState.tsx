import { type ReactNode } from 'react'
import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { Button } from './Button'
import { MochiAvatar } from './MochiAvatar'
import { MochiLoader } from './MochiLoader'
import { kawaiiSpring, gentleSpring } from '@/lib/animations'

type EmptyStateVariant = 'no-data' | 'all-done' | 'error' | 'no-habits' | 'loading'

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
  const isError = variant === 'error'
  const isLoading = variant === 'loading'
  const isNoHabits = variant === 'no-habits'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 px-6 text-center',
        className,
      )}
    >
      <div className="relative">
        {isLoading ? (
          <MochiLoader size={80} />
        ) : isAllDone ? (
          <>
            {/* Floating Mochi with celebrate expression */}
            <m.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <MochiAvatar expression="celebrate" size="xl" enablePetting />
            </m.div>

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
        ) : isError ? (
          <MochiAvatar
            expression="confused"
            size="xl"
            alt="Mochi confused"
            className="animate-[head-shake_400ms_ease_2]"
          />
        ) : isNoHabits ? (
          <MochiAvatar
            expression="sleep"
            size="xl"
            alt="Mochi sleeping"
            className="opacity-80"
          />
        ) : (
          <MochiAvatar
            size="xl"
            alt="Mochi idle"
            className="opacity-60 grayscale-[30%]"
          />
        )}
      </div>

      {!isLoading && (
        <m.div
          className="space-y-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={gentleSpring}
        >
          <m.h3
            className={cn(
              'font-heading text-text-primary',
              isAllDone
                ? 'text-2xl font-extrabold tracking-tight'
                : 'text-lg font-semibold',
            )}
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
      )}

      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}
