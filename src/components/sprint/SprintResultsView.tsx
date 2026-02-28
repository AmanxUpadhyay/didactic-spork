import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { SprintResultsReveal } from './SprintResultsReveal'
import { ScoreBreakdown } from './ScoreBreakdown'
import { SprintHistoryCard } from './SprintHistoryCard'
import { supabase } from '@/lib/supabase'
import type { ScoreBreakdown as ScoreBreakdownType } from '@/hooks/useSprint'
import type { Database } from '@/types/database'

type AppreciationNote = Database['public']['Tables']['appreciation_notes']['Row']

interface SprintHistoryItem {
  id: string
  week_start: string
  my_score: number
  partner_score: number
  i_won: boolean
  is_tie: boolean
}

interface SprintResultsViewProps {
  myScore: number
  partnerScore: number
  myName: string
  partnerName: string
  iWon: boolean
  isTie: boolean
  myBreakdown: ScoreBreakdownType | null
  partnerBreakdown: ScoreBreakdownType | null
  myNote: AppreciationNote | null
  partnerNote: AppreciationNote | null
}

export function SprintResultsView({
  myScore,
  partnerScore,
  myName,
  partnerName,
  iWon,
  isTie,
  myBreakdown,
  partnerBreakdown,
  myNote,
  partnerNote,
}: SprintResultsViewProps) {
  const [history, setHistory] = useState<SprintHistoryItem[]>([])

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase.rpc('get_sprint_history', { p_limit: 10 })
    if (data) {
      setHistory(data as unknown as SprintHistoryItem[])
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-semibold text-text-primary">Sprint Results</h1>

      {/* Partner's appreciation note */}
      {partnerNote && (
        <Card>
          <p className="text-xs text-text-secondary mb-1">From {partnerName}:</p>
          <p className="text-sm text-text-primary italic">"{partnerNote.content}"</p>
        </Card>
      )}

      {/* My note (collapsed) */}
      {myNote && (
        <Card className="!bg-primary/5">
          <p className="text-xs text-text-secondary mb-1">Your note to {partnerName}:</p>
          <p className="text-sm text-text-primary italic">"{myNote.content}"</p>
        </Card>
      )}

      {/* Results reveal animation */}
      <SprintResultsReveal
        myScore={myScore}
        partnerScore={partnerScore}
        myName={myName}
        partnerName={partnerName}
        iWon={iWon}
        isTie={isTie}
      />

      {/* Score breakdowns side-by-side */}
      {myBreakdown && (
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">Your breakdown</h3>
          <ScoreBreakdown {...myBreakdown} />
        </div>
      )}

      {partnerBreakdown && (
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">{partnerName}'s breakdown</h3>
          <ScoreBreakdown {...partnerBreakdown} />
        </div>
      )}

      {/* Sprint history */}
      {history.length > 1 && (
        <div>
          <h3 className="font-heading text-base font-semibold text-text-primary mb-2">
            Past Sprints
          </h3>
          <div className="space-y-2">
            {history.slice(1).map((s) => (
              <SprintHistoryCard key={s.id} sprint={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
