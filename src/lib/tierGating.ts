export type TierName = 'seedling' | 'sprout' | 'bloom' | 'mighty_oak' | 'unshakeable'

export type Feature =
  | 'custom_themes'
  | 'streak_freeze'
  | 'ai_task_suggestions'
  | 'personality_modes'
  | 'bonus_veto'
  | 'couple_rescue'
  | 'prestige_reset'
  | 'surprise_dates'

const TIER_INDEX: Record<TierName, number> = {
  seedling: 0,
  sprout: 1,
  bloom: 2,
  mighty_oak: 3,
  unshakeable: 4,
}

const FEATURE_TIER: Record<Feature, TierName> = {
  custom_themes: 'sprout',
  streak_freeze: 'sprout',
  ai_task_suggestions: 'bloom',
  personality_modes: 'bloom',
  bonus_veto: 'mighty_oak',
  couple_rescue: 'mighty_oak',
  surprise_dates: 'mighty_oak',
  prestige_reset: 'unshakeable',
}

const TIER_DISPLAY: Record<TierName, string> = {
  seedling: 'Seedling',
  sprout: 'Sprout',
  bloom: 'Bloom',
  mighty_oak: 'Mighty Oak',
  unshakeable: 'Unshakeable',
}

const TIER_THRESHOLDS: Record<TierName, number> = {
  seedling: 0,
  sprout: 30,
  bloom: 120,
  mighty_oak: 300,
  unshakeable: 600,
}

export function isFeatureUnlocked(tier: TierName, feature: Feature): boolean {
  return TIER_INDEX[tier] >= TIER_INDEX[FEATURE_TIER[feature]]
}

export function getTierDisplayName(tier: TierName): string {
  return TIER_DISPLAY[tier] ?? 'Seedling'
}

export function getTierThreshold(tier: TierName): number {
  return TIER_THRESHOLDS[tier] ?? 0
}

export function getNextTier(tier: TierName): TierName | null {
  const tiers: TierName[] = ['seedling', 'sprout', 'bloom', 'mighty_oak', 'unshakeable']
  const idx = tiers.indexOf(tier)
  return idx >= 0 && idx < tiers.length - 1 ? (tiers[idx + 1] ?? null) : null
}

export function getFeatureUnlockTier(feature: Feature): TierName {
  return FEATURE_TIER[feature]
}

export function getAllFeaturesForTier(tier: TierName): Feature[] {
  const idx = TIER_INDEX[tier]
  return (Object.entries(FEATURE_TIER) as [Feature, TierName][])
    .filter(([, t]) => TIER_INDEX[t] <= idx)
    .map(([f]) => f)
}

export function getNewFeaturesForTier(tier: TierName): Feature[] {
  return (Object.entries(FEATURE_TIER) as [Feature, TierName][])
    .filter(([, t]) => t === tier)
    .map(([f]) => f)
}
