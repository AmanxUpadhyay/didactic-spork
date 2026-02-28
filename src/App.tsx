import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { LoadingState } from '@/components/ui/LoadingState'
import { PairingProvider, usePairing } from '@/contexts/PairingContext'
import { AuthFlow } from '@/screens/AuthFlow'
import { PairingFlow } from '@/screens/PairingFlow'
import { AppShell } from '@/screens/AppShell'

function AppRouter() {
  const { profile, loading: authLoading, signIn, signUp, signOut } = useAuth()
  useTheme()

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <LoadingState message="Starting Jugalbandi..." />
      </div>
    )
  }

  if (!profile) {
    return <AuthFlow onLogin={signIn} onSignUp={signUp} />
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
