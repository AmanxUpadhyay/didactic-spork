import { cn } from '@/lib/cn'
import { MochiAvatar } from '@/components/ui/MochiAvatar'
import { AppreciationForm } from './AppreciationForm'

interface AppreciationGateViewProps {
  myNoteWritten: boolean
  partnerNoteWritten: boolean
  partnerName: string
  onSubmitNote: (content: string) => Promise<{ success: boolean; error?: string }>
}

export function AppreciationGateView({
  myNoteWritten,
  partnerNoteWritten,
  partnerName,
  onSubmitNote,
}: AppreciationGateViewProps) {
  // If I haven't written my note yet, show the form
  if (!myNoteWritten) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Sprint Complete</h1>
          <p className="text-sm text-text-secondary">Before seeing results, share some appreciation</p>
        </div>
        <AppreciationForm partnerName={partnerName} onSubmit={onSubmitNote} />
      </div>
    )
  }

  // I've written mine, waiting for partner
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12">
      <MochiAvatar
        size="xl"
        alt="Mochi waiting"
        className="animate-[float_3s_ease-in-out_infinite]"
      />
      <div className="text-center space-y-1.5">
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Note sent!
        </h3>
        <p className="text-sm text-text-secondary max-w-[260px]">
          Waiting for {partnerName} to write their appreciation note...
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          'w-3 h-3 rounded-full',
          myNoteWritten ? 'bg-success' : 'bg-border',
        )} />
        <span className="text-xs text-text-secondary">You</span>
        <span className={cn(
          'w-3 h-3 rounded-full',
          partnerNoteWritten ? 'bg-success' : 'bg-border animate-pulse',
        )} />
        <span className="text-xs text-text-secondary">{partnerName}</span>
      </div>
    </div>
  )
}
