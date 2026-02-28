import { type ReactNode, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-[rgba(74,55,40,0.3)]',
          'animate-[fade-in_200ms_ease-out]',
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-surface',
          'rounded-t-[var(--radius-modal)]',
          'shadow-[var(--shadow-elevated)]',
          'animate-[slide-up_400ms_var(--ease-layout)]',
          'max-h-[85vh] overflow-y-auto',
          'pb-[env(safe-area-inset-bottom)]',
          className,
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  )
}
