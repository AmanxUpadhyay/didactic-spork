import { MochiAvatar } from '@/components/ui'

export function WaitingForPartner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <MochiAvatar size="lg" className="animate-[float_3s_ease-in-out_infinite]" alt="Mochi waiting" />
      <div className="text-center space-y-1">
        <p className="font-heading text-lg font-semibold text-text-primary">
          Waiting for your partner...
        </p>
        <p className="text-sm text-text-secondary">
          They&apos;ll need to enter your invite code
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
