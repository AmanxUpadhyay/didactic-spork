import { m } from 'motion/react'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/animations'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastData {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success bg-success/10',
  error: 'border-error bg-error/10',
  info: 'border-primary bg-primary/10',
}

const variantEmoji: Record<ToastVariant, string> = {
  success: '✨',
  error: '😖',
  info: '💬',
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <m.div
      role="alert"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={{ left: 0.05, right: 0.3 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80 || info.velocity.x > 300) {
          onDismiss(toast.id)
        }
      }}
      onClick={() => onDismiss(toast.id)}
      className={cn(
        'flex items-center gap-3',
        'px-4 py-3 rounded-[var(--radius-card)]',
        'border-2 shadow-[var(--shadow-elevated)]',
        'cursor-pointer select-none',
        variantStyles[toast.variant],
      )}
    >
      <span className="text-xl flex-shrink-0" role="img">
        {variantEmoji[toast.variant]}
      </span>
      <p className="text-sm font-medium text-text-primary flex-1">
        {toast.message}
      </p>
    </m.div>
  )
}
