import { m } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { useNotificationPermission } from '@/hooks/useNotificationPermission'
import { kawaiiSpring, staggerContainer, staggerItem } from '@/lib/animations'

interface NotifPermissionScreenProps {
  onComplete: () => void
  onSkip: () => void
}

export function NotifPermissionScreen({ onComplete, onSkip }: NotifPermissionScreenProps) {
  const { requestPermission, loading, isGranted } = useNotificationPermission()

  const handleEnable = async () => {
    await requestPermission()
    onComplete()
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
      <m.div
        className="space-y-6 max-w-xs w-full"
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
      >
        <m.div variants={staggerItem} className="flex justify-center">
          <m.img
            src="/image/mochi-sparkle.png"
            alt="Mochi sparkle"
            className="w-32 h-32 object-contain motion-safe:animate-[float_3s_ease-in-out_infinite]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={kawaiiSpring}
          />
        </m.div>

        <m.div variants={staggerItem} className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Stay in the loop
          </h2>
          <p className="text-sm text-text-secondary leading-body">
            Get reminders when streaks are at risk and daily nudges to stay on track.
          </p>
        </m.div>

        {isGranted ? (
          <m.div variants={staggerItem} className="space-y-3">
            <p className="text-sm text-success font-semibold">Notifications enabled!</p>
            <Button size="lg" className="w-full" onClick={onComplete}>
              Done
            </Button>
          </m.div>
        ) : (
          <m.div variants={staggerItem} className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={handleEnable}
              disabled={loading}
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-text-secondary"
              onClick={onSkip}
            >
              Maybe later
            </Button>
          </m.div>
        )}
      </m.div>
    </div>
  )
}
