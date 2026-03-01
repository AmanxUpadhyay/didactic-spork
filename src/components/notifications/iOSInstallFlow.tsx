import { Card } from '@/components/ui'

export function IOSInstallFlow() {
  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-semibold text-text-primary">Enable Push Notifications</h3>
      <p className="text-sm text-text-secondary">
        iOS requires the app to be installed on your Home Screen for notifications to work.
      </p>
      <div className="space-y-3">
        {[
          { step: 1, icon: '📤', text: 'Tap the Share button in Safari' },
          { step: 2, icon: '➕', text: 'Scroll down and tap "Add to Home Screen"' },
          { step: 3, icon: '✅', text: 'Open Jugalbandi from your Home Screen' },
          { step: 4, icon: '🔔', text: 'Enable notifications when prompted' },
        ].map(({ step, icon, text }) => (
          <Card key={step} className="!py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{icon}</span>
              <div className="flex-1">
                <span className="text-xs font-medium text-primary">Step {step}</span>
                <p className="text-sm text-text-primary">{text}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
