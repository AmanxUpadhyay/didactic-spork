import { cn } from '@/lib/cn'

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
  success: '\u2728',
  error: '\uD83D\uDE16',
  info: '\uD83D\uDCAC',
}

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3',
        'px-4 py-3 rounded-[var(--radius-card)]',
        'border-2 shadow-[var(--shadow-elevated)]',
        'animate-[slide-up_300ms_var(--ease-enter)]',
        'cursor-pointer select-none',
        variantStyles[toast.variant],
      )}
      onClick={() => onDismiss(toast.id)}
    >
      <span className="text-xl flex-shrink-0" role="img">
        {variantEmoji[toast.variant]}
      </span>
      <p className="text-sm font-medium text-text-primary flex-1">
        {toast.message}
      </p>
    </div>
  )
}
