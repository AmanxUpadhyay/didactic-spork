import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface TomorrowTeaserProps {
  tomorrowTaskCount: number
  className?: string
}

export function TomorrowTeaser({ tomorrowTaskCount, className = '' }: TomorrowTeaserProps) {
  const { profile } = useAuth()
  const [intention, setIntention] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!intention.trim() || !profile?.id) return

    // Store as implementation intention
    await supabase.from('implementation_intentions').insert({
      user_id: profile.id,
      task_id: '00000000-0000-0000-0000-000000000000', // placeholder - general intention
      trigger_situation: 'Tomorrow morning',
      planned_action: intention.trim(),
      active: true,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Card className={`!bg-indigo-50 dark:!bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌙</span>
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Tomorrow Preview</p>
        </div>
        <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
          {tomorrowTaskCount} habit{tomorrowTaskCount !== 1 ? 's' : ''} due tomorrow. Plan your first move:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="When I wake up, I'll..."
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-indigo-900/30 text-sm text-text-primary border border-indigo-200 dark:border-indigo-700 placeholder:text-indigo-300"
          />
          <Button size="sm" onClick={handleSave} disabled={!intention.trim() || saved}>
            {saved ? '✓' : 'Set'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
