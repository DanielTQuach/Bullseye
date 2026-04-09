import pricingJson from '../data/openrouterPricing.json'

type PricingEntry = {
  openRouterId: string
  promptUsdPerToken: number
  completionUsdPerToken: number
}

type PricingFile = {
  syncedAt: string
  source: string
  referenceTokens: { prompt: number; completion: number }
  byBullseyeId: Record<string, PricingEntry>
}

const pricing = pricingJson as PricingFile

/** One “reference” API call: N prompt + M completion tokens (OpenRouter list prices). */
export function referenceTripUsd(bullseyeId: string): number | null {
  const e = pricing.byBullseyeId[bullseyeId]
  if (!e) return null
  const { prompt, completion } = pricing.referenceTokens
  return prompt * e.promptUsdPerToken + completion * e.completionUsdPerToken
}

export function pricingSyncedAt(): string {
  return pricing.syncedAt
}

export function referenceTokenAssumption(): {
  prompt: number
  completion: number
} {
  return { ...pricing.referenceTokens }
}

export function maxReferenceTripUsd(): number {
  let max = 0
  for (const id of Object.keys(pricing.byBullseyeId)) {
    const u = referenceTripUsd(id)
    if (u != null && u > max) max = u
  }
  return max || 1
}
