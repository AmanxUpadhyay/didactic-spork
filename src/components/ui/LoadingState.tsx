import { cn } from '@/lib/cn'
import { MochiAvatar } from './MochiAvatar'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12',
        className,
      )}
    >
      <MochiAvatar size="lg" className="animate-[float_3s_ease-in-out_infinite]" alt="Mochi loading" />
      <p className="text-sm text-text-secondary font-medium animate-pulse">
        {message}
      </p>
    </div>
  )
}
