interface OptOutButtonProps {
  feature: string
  label: string
  enabled: boolean
  onToggle: (feature: string) => void
}

export function OptOutButton({ feature, label, enabled, onToggle }: OptOutButtonProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(feature)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-surface-secondary'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}
