import { useState, useRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { pageTransitionSpring } from '@/lib/animations'
import { WelcomeScreen } from './WelcomeScreen'
import { HowItWorksScreen } from './HowItWorksScreen'
import { GoalSetupScreen } from './GoalSetupScreen'
import { KiraIntroScreen } from './KiraIntroScreen'
import { NotifPermissionScreen } from './NotifPermissionScreen'

interface OnboardingFlowProps {
  userId: string
  onComplete: () => void
}

const TOTAL_STEPS = 5

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const direction = useRef<'forward' | 'back'>('forward')

  const goNext = () => {
    direction.current = 'forward'
    setStep((s) => s + 1)
  }

  const skip = () => {
    localStorage.setItem('jugalbandi_onboarding_complete', '1')
    onComplete()
  }

  const complete = () => {
    localStorage.setItem('jugalbandi_onboarding_complete', '1')
    onComplete()
  }

  const slideVariants = {
    hidden: (dir: 'forward' | 'back') => ({
      opacity: 0,
      x: dir === 'forward' ? 60 : -60,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: pageTransitionSpring,
    },
    exit: (dir: 'forward' | 'back') => ({
      opacity: 0,
      x: dir === 'forward' ? -60 : 60,
      transition: { duration: 0.2 },
    }),
  }

  const screens = [
    <WelcomeScreen key="welcome" onNext={goNext} onSkip={skip} />,
    <HowItWorksScreen key="how-it-works" onNext={goNext} onSkip={skip} />,
    <GoalSetupScreen key="goal-setup" userId={userId} onNext={goNext} onSkip={skip} />,
    <KiraIntroScreen key="kira-intro" onNext={goNext} onSkip={skip} />,
    <NotifPermissionScreen key="notif" onComplete={complete} onSkip={skip} />,
  ]

  return (
    <div className="min-h-dvh bg-background flex flex-col overflow-hidden">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-2 shrink-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <m.div
            key={i}
            className="h-2 rounded-full bg-primary"
            animate={{
              width: i === step ? 20 : 8,
              opacity: i === step ? 1 : i < step ? 0.5 : 0.2,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction.current}>
          <m.div
            key={step}
            custom={direction.current}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0"
          >
            {screens[step]}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
