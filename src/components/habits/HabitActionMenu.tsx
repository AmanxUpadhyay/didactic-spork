import { BottomSheet } from '@/components/ui'

interface HabitActionMenuProps {
  open: boolean
  onClose: () => void
  habitTitle: string
  onEdit: () => void
  onArchive: () => void
}

export function HabitActionMenu({
  open,
  onClose,
  habitTitle,
  onEdit,
  onArchive,
}: HabitActionMenuProps) {
  function handleEdit() {
    onEdit()
    onClose()
  }

  function handleArchive() {
    onArchive()
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 className="font-heading text-lg font-semibold text-text-primary truncate">
        {habitTitle}
      </h3>
      <div className="mt-3 space-y-1">
        <button
          type="button"
          onClick={handleEdit}
          className="w-full text-left px-4 py-3 rounded-[var(--radius-card)] hover:bg-primary/5 flex items-center gap-3 text-text-primary font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
            <path
              d="M14.85 2.85a1.5 1.5 0 0 1 2.12 0l0.18 0.18a1.5 1.5 0 0 1 0 2.12L7.5 14.8l-3.3.83.83-3.3L14.85 2.85Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </button>
        <button
          type="button"
          onClick={handleArchive}
          className="w-full text-left px-4 py-3 rounded-[var(--radius-card)] hover:bg-primary/5 flex items-center gap-3 text-error font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
            <path
              d="M3 5h14M5 5v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5M8 9v4M12 9v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Archive
        </button>
      </div>
    </BottomSheet>
  )
}
