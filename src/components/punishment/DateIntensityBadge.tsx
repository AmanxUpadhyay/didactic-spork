import type { PunishmentIntensity } from '@/types/punishment'

const INTENSITY_CONFIG: Record<PunishmentIntensity, { label: string; bg: string; text: string }> = {
  gentle: { label: 'Gentle', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  moderate: { label: 'Moderate', bg: 'bg-amber-100', text: 'text-amber-700' },
  spicy: { label: 'Spicy', bg: 'bg-rose-100', text: 'text-rose-700' },
}

interface DateIntensityBadgeProps {
  intensity: PunishmentIntensity
  budget: number
  className?: string
}

export function DateIntensityBadge({ intensity, budget, className = '' }: DateIntensityBadgeProps) {
  const config = INTENSITY_CONFIG[intensity]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
      <span className="opacity-60">|</span>
      <span>£{budget}</span>
    </span>
  )
}
