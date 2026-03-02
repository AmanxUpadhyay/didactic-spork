import type { MochiExpression } from '@/components/ui/MochiAvatar'

interface MochiStateContext {
  allDoneToday?: boolean
  streakDays?: number
  streakBroken?: boolean
  isLateNight?: boolean     // past midnight / late evening
  partnerAhead?: boolean
  sprintWon?: boolean | null // null = in progress
  isLoading?: boolean
}

/**
 * Determines the appropriate Mochi expression based on current app state.
 * Maps semantic app context to the available Mochi image expressions.
 */
export function useMochiState(ctx: MochiStateContext = {}): MochiExpression {
  if (ctx.isLoading) return 'idle'
  if (ctx.allDoneToday) return 'celebrate'
  if (ctx.streakBroken) return 'confused'
  if (ctx.sprintWon === true) return 'celebrate'
  if (ctx.sprintWon === false) return 'sparkle'   // encouraging after loss
  if (ctx.isLateNight) return 'sleep'
  if (ctx.streakDays !== undefined && ctx.streakDays >= 7) return 'happy-bounce'
  if (ctx.partnerAhead) return 'curious'
  return 'idle'
}
