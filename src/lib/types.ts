export type TaskProfile =
  | 'code'
  | 'reasoning'
  | 'creative'
  | 'fast_cheap'
  | 'general'

export interface ModelSpec {
  id: string
  name: string
  provider: string
  /** 1–10, higher = more $ per token (normalized). */
  costIndex: number
  energyIndex: number
  waterIndex: number
  /** 1–10, lower = faster typical TTFT. */
  latencyIndex: number
  /** Suitability 0–1 per task shape. */
  quality: Record<TaskProfile, number>
}

export interface RouteResult {
  taskProfile: TaskProfile
  confidence: number
  chosen: ModelSpec
  runnerUp: ModelSpec[]
  /** Why this profile was inferred. */
  signals: string[]
  /** vs running each model in the naive fan-out set once. */
  savingsVsFanout: {
    costPct: number
    energyPct: number
    waterPct: number
  }
  fanoutModelCount: number
  /**
   * When OpenRouter pricing JSON is present: same token assumption for every model,
   * vs sum of five fan-out models’ trips — list prices, not your invoice.
   */
  usdReference?: {
    chosenUsd: number
    fanoutSumUsd: number
    savingsPctVsFanoutSum: number
    referenceTokens: { prompt: number; completion: number }
    pricingAsOf: string
  }
}
