/**
 * Fetches public list prices from OpenRouter and writes src/data/openrouterPricing.json.
 * Run: node scripts/sync-openrouter-pricing.mjs
 * Commit the JSON so CI/builds work offline; re-run weekly or before releases.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataDir = join(root, 'src', 'data')
const outPath = join(dataDir, 'openrouterPricing.json')

/** Registry id → OpenRouter model id (update if OpenRouter renames). */
const SLUGS = {
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-4o': 'openai/gpt-4o',
  'claude-3-5-sonnet': 'anthropic/claude-3.7-sonnet',
  'claude-3-haiku': 'anthropic/claude-3-haiku',
  'gemini-1-5-flash': 'google/gemini-2.5-flash',
  'gemini-1-5-pro': 'google/gemini-2.5-pro',
  'mistral-large': 'mistralai/mistral-large-2512',
  'mistral-small': 'mistralai/mistral-small-3.2-24b-instruct',
  'llama-3-1-70b': 'meta-llama/llama-3.1-70b-instruct',
  'command-r-plus': 'cohere/command-r-plus-08-2024',
}

async function main() {
  const res = await fetch('https://openrouter.ai/api/v1/models')
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`)
  const { data } = await res.json()
  const byId = new Map(data.map((m) => [m.id, m]))

  const byBullseyeId = {}
  const missing = []

  for (const [bullseyeId, orId] of Object.entries(SLUGS)) {
    const m = byId.get(orId)
    if (!m?.pricing?.prompt || !m?.pricing?.completion) {
      missing.push(orId)
      continue
    }
    byBullseyeId[bullseyeId] = {
      openRouterId: orId,
      promptUsdPerToken: Number.parseFloat(m.pricing.prompt),
      completionUsdPerToken: Number.parseFloat(m.pricing.completion),
    }
  }

  if (missing.length) {
    console.warn('Missing or incomplete pricing for:', missing.join(', '))
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    source: 'https://openrouter.ai/api/v1/models',
    referenceTokens: { prompt: 1000, completion: 500 },
    byBullseyeId,
  }

  mkdirSync(dataDir, { recursive: true })
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${Object.keys(byBullseyeId).length} models → ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
