import { createContext, useContext, type ReactNode } from 'react'
import { usePartner } from '@/hooks/usePartner'

interface PairingContextValue {
  partnerId: string | null
  partnerProfile: { id: string; name: string; avatar_url: string | null; timezone: string } | null
  isPaired: boolean
  loading: boolean
  generateInviteCode: () => Promise<{ success: boolean; code?: string; error?: string }>
  claimInviteCode: (code: string) => Promise<{ success: boolean; error?: string }>
  refetch: () => Promise<void>
}

const PairingContext = createContext<PairingContextValue | null>(null)

export function usePairing() {
  const ctx = useContext(PairingContext)
  if (!ctx) throw new Error('usePairing must be used within PairingProvider')
  return ctx
}

export function PairingProvider({ userId, children }: { userId: string | undefined; children: ReactNode }) {
  const partner = usePartner(userId)

  return (
    <PairingContext.Provider value={partner}>
      {children}
    </PairingContext.Provider>
  )
}
