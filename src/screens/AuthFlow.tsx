import { useState } from 'react'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'

interface AuthFlowProps {
  onLogin: (email: string, password: string) => Promise<{ error: Error | null }>
  onSignUp: (name: string, email: string, password: string) => Promise<{ error: Error | null }>
  onGoogleSignIn: () => Promise<unknown>
  onAppleSignIn: () => Promise<unknown>
}

export function AuthFlow({ onLogin, onSignUp, onGoogleSignIn, onAppleSignIn }: AuthFlowProps) {
  const [screen, setScreen] = useState<'login' | 'signup'>('login')

  if (screen === 'signup') {
    return (
      <Signup
        onSignUp={onSignUp}
        onSwitchToLogin={() => setScreen('login')}
      />
    )
  }

  return (
    <Login
      onLogin={onLogin}
      onGoogleSignIn={onGoogleSignIn}
      onAppleSignIn={onAppleSignIn}
      onSwitchToSignup={() => setScreen('signup')}
    />
  )
}
