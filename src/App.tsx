import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { LoadingState } from '@/components/ui/LoadingState'
import { PairingProvider, usePairing } from '@/contexts/PairingContext'
import { AuthFlow } from '@/screens/AuthFlow'
import { PairingFlow } from '@/screens/PairingFlow'
import { AppShell } from '@/screens/AppShell'
import { OnboardingFlow } from '@/screens/onboarding/OnboardingFlow'
import { OAuthProfileSetup } from '@/screens/OAuthProfileSetup'
import { PasswordResetScreen } from '@/screens/PasswordResetScreen'

function AppRouter() {
  const {
    profile,
    user,
    loading: authLoading,
    needsProfileSetup,
    isResettingPassword,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    refetchProfile,
    clearPasswordReset,
  } = useAuth()
  const [onboardingDone, setOnboardingDone] = useState(false)
  useTheme()

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <LoadingState message="Starting Jugalbandi..." />
      </div>
    )
  }

  // User arrived via password reset email link
  if (isResettingPassword) {
    return <PasswordResetScreen onComplete={clearPasswordReset} onCancel={clearPasswordReset} />
  }

  // OAuth user has a session but hasn't created their profile row yet
  if (needsProfileSetup && user) {
    return (
      <OAuthProfileSetup
        userId={user.id}
        email={user.email ?? ''}
        onComplete={refetchProfile}
      />
    )
  }

  if (!profile) {
    return (
      <AuthFlow
        onLogin={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
        onAppleSignIn={signInWithApple}
      />
    )
  }

  const hasOnboarded = localStorage.getItem('jugalbandi_onboarding_complete')
  if (!hasOnboarded && !onboardingDone) {
    return (
      <OnboardingFlow
        userId={profile.id}
        onComplete={() => setOnboardingDone(true)}
      />
    )
  }

  return (
    <PairingProvider userId={profile.id}>
      <PairedGate profile={profile} onSignOut={signOut} />
    </PairingProvider>
  )
}

function PairedGate({
  profile,
  onSignOut,
}: {
  profile: { id: string; name: string; avatar_url: string | null; timezone: string }
  onSignOut: () => void
}) {
  const { isPaired, loading } = usePairing()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <LoadingState message="Checking your partner..." />
      </div>
    )
  }

  if (!isPaired) {
    return <PairingFlow />
  }

  return <AppShell profile={profile} onSignOut={onSignOut} />
}

export default function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  )
}
