import { useState } from 'react'
import { m } from 'motion/react'
import { Button } from '@/components/ui/Button'
import { kawaiiSpring, staggerContainer, staggerItem, haptics } from '@/lib/animations'

interface KiraIntroScreenProps {
  onNext: () => void
  onSkip: () => void
}

type PersonalityMode = 'cheerful' | 'tough_love' | 'empathetic'

const PERSONALITIES: Array<{
  id: PersonalityMode
  emoji: string
  label: string
  subtitle: string
}> = [
  { id: 'cheerful', emoji: '✨', label: 'Cheerful', subtitle: 'Hype-driven, celebrates every win' },
  { id: 'tough_love', emoji: '💪', label: 'Tough Love', subtitle: 'Brutally honest, no excuses' },
  { id: 'empathetic', emoji: '💜', label: 'Empathetic', subtitle: 'Supportive, reads your feelings' },
]

export function KiraIntroScreen({ onNext, onSkip }: KiraIntroScreenProps) {
  const [selected, setSelected] = useState<PersonalityMode>('cheerful')

  const handleSelect = (mode: PersonalityMode) => {
    haptics.light()
    setSelected(mode)
  }

  const handleNext = () => {
    localStorage.setItem('jugalbandi_kira_personality', selected)
    onNext()
  }

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-10">
      {/* Skip */}
      <div className="flex justify-end mb-4">
        <button className="text-sm text-text-secondary" onClick={onSkip}>
          Skip
        </button>
      </div>

      <m.div
        className="flex-1 space-y-6"
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate="visible"
      >
        {/* Mochi */}
        <m.div variants={staggerItem} className="flex justify-center">
          <m.img
            src="/image/mochi-love.png"
            alt="Kira"
            className="w-32 h-32 object-contain motion-safe:animate-[float_3s_ease-in-out_infinite]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={kawaiiSpring}
          />
        </m.div>

        <m.div variants={staggerItem} className="text-center space-y-1">
          <h2 className="font-heading text-2xl font-bold text-text-primary">Meet Kira</h2>
          <p className="text-sm text-text-secondary">
            Your AI judge. Pick her personality style.
          </p>
        </m.div>

        <m.div variants={staggerItem} className="space-y-3">
          {PERSONALITIES.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={[
                'w-full text-left p-4 rounded-[var(--radius-card)] border transition-all',
                selected === p.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{p.label}</p>
                  <p className="text-xs text-text-secondary">{p.subtitle}</p>
                </div>
                {selected === p.id && (
                  <m.div
                    className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={kawaiiSpring}
                  >
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </m.div>
                )}
              </div>
            </button>
          ))}
        </m.div>
      </m.div>

      <Button size="lg" className="w-full mt-6" onClick={handleNext}>
        Set Kira's style
      </Button>
    </div>
  )
}
