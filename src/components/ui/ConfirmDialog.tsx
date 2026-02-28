import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { cn } from '@/lib/cn'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm()
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 className="font-heading text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <p className="text-sm text-text-secondary mt-2">{message}</p>
      <div className="flex gap-3 mt-5">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant="ghost"
          className={cn('flex-1', destructive && 'text-error')}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </BottomSheet>
  )
}
