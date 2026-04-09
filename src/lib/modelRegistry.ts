import type { ModelSpec, TaskProfile } from './types'

/**
 * Quality/latency/footprint indices are hand-tuned for the demo.
 * **USD:** `src/data/openrouterPricing.json` (run `npm run sync:pricing`) drives list-price cost scoring.
 */
const q = (
  code: number,
  reasoning: number,
  creative: number,
  fast_cheap: number,
  general: number,
): Record<TaskProfile, number> => ({
  code,
  reasoning,
  creative,
  fast_cheap,
  general,
})

export const MODELS: ModelSpec[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    costIndex: 2,
    energyIndex: 2,
    waterIndex: 2,
    latencyIndex: 2,
    quality: q(0.62, 0.58, 0.55, 0.92, 0.65),
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    costIndex: 8,
    energyIndex: 8,
    waterIndex: 8,
    latencyIndex: 5,
    quality: q(0.88, 0.85, 0.82, 0.45, 0.88),
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    costIndex: 9,
    energyIndex: 8,
    waterIndex: 8,
    latencyIndex: 6,
    quality: q(0.94, 0.9, 0.84, 0.4, 0.9),
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    costIndex: 3,
    energyIndex: 3,
    waterIndex: 3,
    latencyIndex: 2,
    quality: q(0.68, 0.62, 0.58, 0.88, 0.68),
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    costIndex: 2,
    energyIndex: 2,
    waterIndex: 2,
    latencyIndex: 2,
    quality: q(0.65, 0.62, 0.6, 0.9, 0.7),
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    costIndex: 7,
    energyIndex: 7,
    waterIndex: 7,
    latencyIndex: 6,
    quality: q(0.86, 0.88, 0.8, 0.42, 0.86),
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    costIndex: 7,
    energyIndex: 7,
    waterIndex: 7,
    latencyIndex: 5,
    quality: q(0.84, 0.82, 0.78, 0.48, 0.82),
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral',
    costIndex: 3,
    energyIndex: 3,
    waterIndex: 3,
    latencyIndex: 3,
    quality: q(0.7, 0.66, 0.62, 0.85, 0.72),
  },
  {
    id: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta / hosts',
    costIndex: 5,
    energyIndex: 6,
    waterIndex: 6,
    latencyIndex: 5,
    quality: q(0.8, 0.78, 0.72, 0.55, 0.8),
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    costIndex: 6,
    energyIndex: 6,
    waterIndex: 6,
    latencyIndex: 5,
    quality: q(0.75, 0.8, 0.74, 0.52, 0.78),
  },
]

/** Naive “try five big models” baseline — used only to estimate savings. */
export const NAIVE_FANOUT_IDS: string[] = [
  'gpt-4o',
  'claude-3-5-sonnet',
  'gemini-1-5-pro',
  'mistral-large',
  'command-r-plus',
]

export function modelById(id: string): ModelSpec | undefined {
  return MODELS.find((m) => m.id === id)
}
