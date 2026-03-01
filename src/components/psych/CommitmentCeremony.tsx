import { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function CommitmentCeremony() {
  const { profile } = useAuth()
  const [myHabits, setMyHabits] = useState<string[]>([])
  const [committed, setCommitted] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    async function load() {
      const { data } = await supabase
        .from('tasks')
        .select('title')
        .eq('user_id', profile!.id)
        .eq('active', true)
      setMyHabits((data || []).map((t: { title: string }) => t.title))
    }
    load()
  }, [profile?.id])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-3xl">🤝</span>
        <h3 className="font-heading text-lg font-semibold text-text-primary mt-2">Weekly Commitment</h3>
        <p className="text-xs text-text-secondary mt-1">Lock in your habits for next week</p>
      </div>

      <Card>
        <h4 className="text-sm font-medium text-text-primary mb-2">Your Habits ({myHabits.length})</h4>
        <div className="space-y-1.5">
          {myHabits.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs">{committed ? '✅' : '⬜'}</span>
              <span className="text-sm text-text-primary">{h}</span>
            </div>
          ))}
        </div>
      </Card>

      {!committed && (
        <Button className="w-full" onClick={() => setCommitted(true)}>
          I commit to these habits
        </Button>
      )}

      {committed && (
        <div className="text-center animate-[slideUp_300ms_var(--ease-bouncy)]">
          <p className="text-sm font-medium text-primary">Committed! Good luck this week 💪</p>
        </div>
      )}
    </div>
  )
}
