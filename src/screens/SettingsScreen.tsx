import { Card, Button, ThemeSwitcher, MochiAvatar } from '@/components/ui'

interface SettingsScreenProps {
  profile: { id: string; name: string; avatar_url: string | null; timezone: string }
  partnerName?: string
  onSignOut: () => void
}

export function SettingsScreen({ profile, partnerName, onSignOut }: SettingsScreenProps) {
  return (
    <div className="px-5 pt-6 pb-24 space-y-4">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Settings</h1>

      <Card>
        <div className="flex items-center gap-4">
          <MochiAvatar size="sm" className="rounded-full bg-primary/10" />
          <div>
            <p className="font-heading text-lg font-semibold text-text-primary">{profile.name}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-[var(--radius-pill)] bg-primary/10 text-primary text-xs font-semibold">
              Seedling
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h2 className="font-heading text-base font-semibold text-text-primary">Theme</h2>
          <ThemeSwitcher />
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <h2 className="font-heading text-base font-semibold text-text-primary">Notifications</h2>
          <p className="text-sm text-text-secondary opacity-50">Coming in Phase 5</p>
        </div>
      </Card>

      {partnerName && (
        <Card>
          <div className="space-y-1">
            <h2 className="font-heading text-base font-semibold text-text-primary">Partner</h2>
            <p className="text-sm text-text-secondary">{partnerName}</p>
          </div>
        </Card>
      )}

      <Button variant="ghost" className="w-full" onClick={onSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
