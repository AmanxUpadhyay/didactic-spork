import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { kawaiiSpring, staggerContainer, staggerItem } from '@/lib/animations'

interface WelcomeScreenProps {
  onNext: () => void
  onSkip: () => void
}

export function WelcomeScreen({ onNext, onSkip }: WelcomeScreenProps) {
  const [mochiStage, setMochiStage] = useState<'hatch' | 'idle'>('hatch')
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setMochiStage('idle'), 800)
    const t2 = setTimeout(() => setShowText(true), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
      {/* Skip button */}
      <button
        className="absolute top-4 right-5 text-sm text-text-secondary"
        onClick={onSkip}
      >
        Skip
      </button>

      {/* Mochi animation */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {mochiStage === 'hatch' ? (
            <m.img
              key="hatch"
              src="/image/mochi-hatch.png"
              alt="Mochi hatching"
              className="w-32 h-32 object-contain"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={kawaiiSpring}
            />
          ) : (
            <m.img
              key="idle"
              src="/image/mochi-idle.png"
              alt="Mochi"
              className="w-32 h-32 object-contain motion-safe:animate-[float_3s_ease-in-out_infinite]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Text + CTA */}
      <AnimatePresence>
        {showText && (
          <m.div
            className="space-y-4 max-w-xs"
            variants={staggerContainer(0.12)}
            initial="hidden"
            animate="visible"
          >
            <m.h1
              variants={staggerItem}
              className="font-heading text-4xl font-extrabold text-text-primary leading-display"
            >
              You two vs. your worst habits
            </m.h1>
            <m.p
              variants={staggerItem}
              className="text-base text-text-secondary leading-body"
            >
              Build streaks. Compete weekly. Winner makes the rules.
            </m.p>
            <m.div variants={staggerItem}>
              <Button
                size="lg"
                className="w-full"
                onClick={onNext}
              >
                Let's go
              </Button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
