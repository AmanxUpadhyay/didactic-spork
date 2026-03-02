import { type ReactNode, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import { cn } from '@/lib/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

const sheetTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 40,
  mass: 0.8,
}

const fastTransition = { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const }

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

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Overlay — fades in/out */}
          <m.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={fastTransition}
            className="absolute inset-0 bg-[rgba(74,55,40,0.3)]"
            onClick={onClose}
          />

          {/* Sheet — springs up, slides down on exit */}
          <m.div
            ref={sheetRef}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={sheetTransition}
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'bg-surface',
              'rounded-t-[var(--radius-modal)]',
              'shadow-[var(--shadow-elevated)]',
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
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
