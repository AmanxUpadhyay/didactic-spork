import { cn } from '@/lib/cn'

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
      <img
        src="/image/mochi.png"
        alt="Mochi loading"
        className="w-24 h-24 object-contain animate-[float_3s_ease-in-out_infinite]"
      />
      <p className="text-sm text-text-secondary font-medium animate-pulse">
        {message}
      </p>
    </div>
  )
}
