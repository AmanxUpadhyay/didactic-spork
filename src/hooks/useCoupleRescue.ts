import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { usePairing } from '@/contexts/PairingContext'
import { useKira } from '@/hooks/useKira'

interface RescueState {
  streakId: string
  streakTaskTitle: string
  streakDays: number
  partnerName: string
}

interface ActiveRescue {
  id: string
  streakId: string
  rescueTaskTitle: string
  completed: boolean
  cooldownUntil: string
}

export function useCoupleRescue() {
  const { profile } = useAuth()
  const { partnerProfile } = usePairing()
  const { invoke, loading: generating } = useKira()

  const [canRescue, setCanRescue] = useState(false)
  const [partnerStreakInDanger, setPartnerStreakInDanger] = useState<RescueState | null>(null)
  const [activeRescue, setActiveRescue] = useState<ActiveRescue | null>(null)
  const [onCooldown, setOnCooldown] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkRescueState = useCallback(async () => {
    if (!profile?.id || !partnerProfile?.id) {
      setLoading(false)
      return
    }

    // Check if partner has any broken streaks eligible for rescue
    const { data: brokenStreaks } = await supabase
      .from('streaks')
      .select('id, current_days, task_id, couple_rescue_available')
      .eq('user_id', partnerProfile.id)
      .eq('couple_rescue_available', true)
      .limit(1)

    const streak = brokenStreaks?.[0]
    if (streak) {
      let taskTitle = 'Unknown habit'
      if (streak.task_id) {
        const { data: task } = await supabase
          .from('tasks')
          .select('title')
          .eq('id', streak.task_id)
          .single()
        if (task) taskTitle = task.title
      }

      setPartnerStreakInDanger({
        streakId: streak.id,
        streakTaskTitle: taskTitle,
        streakDays: streak.current_days,
        partnerName: partnerProfile.name,
      })
    } else {
      setPartnerStreakInDanger(null)
    }

    // Check if rescuer is on cooldown
    const { data: recentRescue } = await supabase
      .from('couple_rescues')
      .select('id, streak_id, rescue_task_title, completed, cooldown_until')
      .eq('rescuer_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentRescue) {
      const cooldownActive = new Date(recentRescue.cooldown_until) > new Date()
      setOnCooldown(cooldownActive)

      if (!recentRescue.completed) {
        setActiveRescue({
          id: recentRescue.id,
          streakId: recentRescue.streak_id,
          rescueTaskTitle: recentRescue.rescue_task_title,
          completed: false,
          cooldownUntil: recentRescue.cooldown_until,
        })
      } else {
        setActiveRescue(null)
      }
    }

    setCanRescue(!!brokenStreaks?.length && !onCooldown)
    setLoading(false)
  }, [profile?.id, partnerProfile?.id, partnerProfile?.name, onCooldown])

  useEffect(() => {
    checkRescueState()
  }, [checkRescueState])

  const initiateRescue = useCallback(async (streakId: string) => {
    if (!profile?.id) return null

    const result = await invoke('rescue_task', { streak_id: streakId })
    checkRescueState()
    return result
  }, [profile?.id, invoke, checkRescueState])

  const completeRescue = useCallback(async () => {
    if (!activeRescue || !profile?.id) return

    // Mark rescue as completed
    await supabase
      .from('couple_rescues')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', activeRescue.id)

    // Reset partner's streak to day 1 (not milestone floor)
    await supabase
      .from('streaks')
      .update({
        current_days: 1,
        couple_rescue_available: false,
        broken_at: null,
        last_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeRescue.streakId)

    setActiveRescue(null)
    checkRescueState()
  }, [activeRescue, profile?.id, checkRescueState])

  return {
    canRescue,
    partnerStreakInDanger,
    activeRescue,
    onCooldown,
    loading,
    generating,
    initiateRescue,
    completeRescue,
    refresh: checkRescueState,
  }
}
