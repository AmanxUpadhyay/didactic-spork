export interface DateOption {
  title: string
  activity: string
  food: string
  extras: string[]
  estimatedCost: number
  rationale: string
  peakMoment?: string
  closingNote?: string
}

export interface SurpriseElement {
  description: string
  revealAt: 'during_date' | 'before_date' | 'after_date'
}

export type PunishmentIntensity = 'gentle' | 'moderate' | 'spicy'

export interface PunishmentState {
  id: string
  sprintId: string
  loserId: string
  winnerId: string | null
  intensity: PunishmentIntensity
  budgetGbp: number
  vetoesGranted: number
  vetoesUsed: number
  datePlan: { options?: DateOption[]; surprise_element?: SurpriseElement | null }
  accepted: boolean
  scheduledDate: string | null
  surpriseElement: SurpriseElement | null
  isMutualFailure: boolean
  isBothWin: boolean
  createdAt: string
}

export interface DateRating {
  id: string
  dateHistoryId: string
  userId: string
  rating: number
  highlights: string | null
  improvements: string | null
  createdAt: string
}

export interface VetoRecord {
  id: string
  punishmentId: string
  userId: string
  vetoedOption: DateOption
  vetoNumber: number
  createdAt: string
}
