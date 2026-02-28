import { useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { LoadingState } from '@/components/ui/LoadingState'
import { Login } from '@/pages/Login'
import { Home } from '@/pages/Home'

function AppContent() {
  const { profile, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <LoadingState message="Starting Jugalbandi..." />
      </div>
    )
  }

  if (!profile) {
    return <Login onLogin={signIn} />
  }

  return <Home profile={profile} onSignOut={signOut} />
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
