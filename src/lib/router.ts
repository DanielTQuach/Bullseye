import { MODELS, NAIVE_FANOUT_IDS, modelById } from './modelRegistry'
import {
  maxReferenceTripUsd,
  referenceTokenAssumption,
  referenceTripUsd,
  pricingSyncedAt,
} from './pricing'
import type { ModelSpec, RouteResult, TaskProfile } from './types'

const CODE_RE =
  /```|def\s+\w+|class\s+\w+|function\s+\w+|import\s+.+from|#include|SELECT\s+[\w*]+\s+FROM|npm\s+|yarn\s+|pnpm\s+|useState|useEffect|=>|\{\s*"/i

const REASONING_WORDS =
  /\b(why|explain|compare|analyze|prove|reason|step by step|trade-?off|implication|evaluate)\b/i

const CREATIVE_WORDS =
  /\b(write a|story|poem|blog|marketing copy|tone|essay|creative|brand voice|headline)\b/i

const MAX_REF_USD = maxReferenceTripUsd()

function detectProfile(text: string): {
  profile: TaskProfile
  confidence: number
  signals: string[]
} {
  const raw = text.trim()
  const t = raw.toLowerCase()
  const signals: string[] = []

  const scores: Record<TaskProfile, number> = {
    code: 0.08,
    reasoning: 0.08,
    creative: 0.08,
    fast_cheap: 0.05,
    general: 0.15,
  }

  if (CODE_RE.test(raw)) {
    scores.code += 0.55
    signals.push('Looks like code or technical structure')
  }
  if (REASONING_WORDS.test(t)) {
    scores.reasoning += 0.45
    signals.push('Reasoning / explanation cues')
  }
  if (CREATIVE_WORDS.test(t)) {
    scores.creative += 0.5
    signals.push('Creative or marketing wording')
  }
  if (raw.length > 0 && raw.length < 48 && scores.code < 0.3) {
    scores.fast_cheap += 0.35
    signals.push('Very short prompt → bias to fast, cheap models')
  }

  let best: TaskProfile = 'general'
  let bestScore = scores.general
  for (const k of Object.keys(scores) as TaskProfile[]) {
    if (scores[k] > bestScore) {
      bestScore = scores[k]
      best = k
    }
  }

  const sorted = (Object.keys(scores) as TaskProfile[])
    .map((k) => ({ k, v: scores[k] }))
    .sort((a, b) => b.v - a.v)
  const second = sorted[1]?.v ?? 0
  const spread = bestScore - second
  const confidence = Math.min(
    0.94,
    Math.max(0.52, 0.58 + spread * 1.15),
  )

  if (signals.length === 0) {
    signals.push('General task — balanced quality/cost tradeoff')
  }

  return { profile: best, confidence, signals }
}

function costTerm(m: ModelSpec): number {
  const usd = referenceTripUsd(m.id)
  if (usd != null && MAX_REF_USD > 0) {
    return Math.max(0, Math.min(1, 1 - usd / MAX_REF_USD))
  }
  return (11 - m.costIndex) / 10
}

function scoreModel(m: ModelSpec, profile: TaskProfile): number {
  const wQ = 0.52
  const wCost = 0.18
  const wLat = 0.14
  const wE = 0.08
  const wW = 0.08

  const quality = m.quality[profile]
  const cTerm = costTerm(m)
  const latTerm = (11 - m.latencyIndex) / 10
  const eTerm = (11 - m.energyIndex) / 10
  const wTerm = (11 - m.waterIndex) / 10

  let latBoost = 1
  if (profile === 'fast_cheap') latBoost = 1.15

  return (
    wQ * quality +
    wCost * cTerm +
    wLat * latTerm * latBoost +
    wE * eTerm +
    wW * wTerm
  )
}

function fanoutTotals(): { cost: number; energy: number; water: number } {
  let cost = 0
  let energy = 0
  let water = 0
  for (const id of NAIVE_FANOUT_IDS) {
    const m = modelById(id)
    if (!m) continue
    cost += m.costIndex
    energy += m.energyIndex
    water += m.waterIndex
  }
  return { cost, energy, water }
}

function fanoutTripUsdSum(): number | null {
  let sum = 0
  for (const id of NAIVE_FANOUT_IDS) {
    const u = referenceTripUsd(id)
    if (u == null) return null
    sum += u
  }
  return sum
}

/**
 * Pure client-side router — no prompt text leaves the browser.
 * Cost scoring prefers OpenRouter list prices when `openrouterPricing.json` is present.
 */
export function routePrompt(prompt: string): RouteResult | null {
  const trimmed = prompt.trim()
  if (!trimmed) return null

  const { profile, confidence, signals } = detectProfile(trimmed)

  const ranked = [...MODELS]
    .map((m) => ({ m, s: scoreModel(m, profile) }))
    .sort((a, b) => b.s - a.s)

  const chosen = ranked[0]!.m
  const runnerUp = ranked.slice(1, 4).map((r) => r.m)

  const fan = fanoutTotals()
  const pct = (total: number, single: number) =>
    total <= 0 ? 0 : Math.round((1 - single / total) * 100)

  const fanUsd = fanoutTripUsdSum()
  const chosenUsd = referenceTripUsd(chosen.id)

  let usdReference: RouteResult['usdReference']
  let costPctLive: number | undefined
  if (fanUsd != null && chosenUsd != null && fanUsd > 0) {
    costPctLive = Math.max(
      0,
      Math.min(99, Math.round((1 - chosenUsd / fanUsd) * 100)),
    )
    usdReference = {
      chosenUsd,
      fanoutSumUsd: fanUsd,
      savingsPctVsFanoutSum: costPctLive,
      referenceTokens: referenceTokenAssumption(),
      pricingAsOf: pricingSyncedAt(),
    }
  }

  return {
    taskProfile: profile,
    confidence,
    chosen,
    runnerUp,
    signals,
    savingsVsFanout: {
      costPct:
        costPctLive ??
        Math.max(0, Math.min(92, pct(fan.cost, chosen.costIndex))),
      energyPct: Math.max(0, Math.min(92, pct(fan.energy, chosen.energyIndex))),
      waterPct: Math.max(0, Math.min(92, pct(fan.water, chosen.waterIndex))),
    },
    fanoutModelCount: NAIVE_FANOUT_IDS.length,
    usdReference,
  }
}
