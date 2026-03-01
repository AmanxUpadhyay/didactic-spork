import { useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { pageTransitionSpring } from '@/lib/animations/config'

interface AuthFlowProps {
  onLogin: (email: string, password: string) => Promise<{ error: Error | null }>
  onSignUp: (name: string, email: string, password: string) => Promise<{ error: Error | null; session?: unknown }>
  onGoogleSignIn: () => Promise<unknown>
  onAppleSignIn: () => Promise<unknown>
}

type Screen = 'login' | 'signup' | 'forgot'

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

export function AuthFlow({ onLogin, onSignUp, onGoogleSignIn, onAppleSignIn }: AuthFlowProps) {
  const [screen, setScreen] = useState<Screen>('login')
  const [direction, setDirection] = useState(1)

  function navigate(to: Screen, dir: number) {
    setDirection(dir)
    setScreen(to)
  }

  return (
    <div className="overflow-hidden min-h-dvh">
      <AnimatePresence mode="sync" custom={direction}>
        {screen === 'login' && (
          <m.div
            key="login"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransitionSpring}
            className="min-h-dvh"
          >
            <Login
              onLogin={onLogin}
              onGoogleSignIn={onGoogleSignIn}
              onAppleSignIn={onAppleSignIn}
              onSwitchToSignup={() => navigate('signup', 1)}
              onForgotPassword={() => navigate('forgot', 1)}
            />
          </m.div>
        )}
        {screen === 'signup' && (
          <m.div
            key="signup"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransitionSpring}
            className="min-h-dvh"
          >
            <Signup
              onSignUp={onSignUp}
              onSwitchToLogin={() => navigate('login', -1)}
              onGoogleSignIn={onGoogleSignIn}
              onAppleSignIn={onAppleSignIn}
              onForgotPassword={() => navigate('forgot', 1)}
            />
          </m.div>
        )}
        {screen === 'forgot' && (
          <m.div
            key="forgot"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransitionSpring}
            className="min-h-dvh"
          >
            <ForgotPassword
              onBack={() => navigate('login', -1)}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
