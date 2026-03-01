import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTrainingWheels() {
  const [isTraining, setIsTraining] = useState(false)
  const [sprintNumber, setSprintNumber] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { count } = await supabase
        .from('sprints')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')

      const completedCount = count ?? 0
      setSprintNumber(completedCount + 1) // current sprint number
      setIsTraining(completedCount < 2)
      setLoading(false)
    }

    check()
  }, [])

  return { isTraining, sprintNumber, loading }
}
