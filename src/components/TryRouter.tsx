import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { trackEvent } from '../lib/analytics'
import { routePrompt } from '../lib/router'
import type { RouteResult, TaskProfile } from '../lib/types'

const ease = [0.16, 1, 0.3, 1] as const

const PROFILE_LABEL: Record<TaskProfile, string> = {
  code: 'Code & technical',
  reasoning: 'Reasoning & analysis',
  creative: 'Creative / marketing',
  fast_cheap: 'Short & fast',
  general: 'General',
}

function bumpLocalRouteCount() {
  try {
    const k = 'bullseye_demo_routes'
    const n = Number.parseInt(localStorage.getItem(k) || '0', 10)
    localStorage.setItem(k, String(n + 1))
  } catch {
    /* ignore */
  }
}

export function TryRouter() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<RouteResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(() => {
    setError(null)
    const r = routePrompt(prompt)
    if (!r) {
      setResult(null)
      setError('Paste a prompt to get a route.')
      return
    }
    setResult(r)
    bumpLocalRouteCount()
    trackEvent('route_demo', {
      task_profile: r.taskProfile,
      model_id: r.chosen.id,
      prompt_len: prompt.trim().length,
      confidence: Math.round(r.confidence * 100) / 100,
      has_usd_reference: Boolean(r.usdReference),
    })
  }, [prompt])

  return (
    <section className="try" id="try" aria-labelledby="try-heading">
      <div className="content">
        <div className="try__head">
          <span className="pill">
            <span className="pill__dot" />
            Routing runs in your browser — prompt stays on your device
          </span>
          <h2 id="try-heading" className="try__title">
            Try the router
          </h2>
          <p className="try__sub">
            Task detection uses lightweight rules (regex + heuristics)—good enough to
            ship a demo; production would add embeddings or a tiny classifier.{' '}
            <strong>Cost scoring uses real OpenRouter list prices</strong> synced into{' '}
            <code className="try__code">openrouterPricing.json</code> (run{' '}
            <code className="try__code">npm run sync:pricing</code>). Quality and
            “energy/water” columns are still <strong>indices</strong>, not measured
            kWh or liters—providers don’t expose per-call footprint APIs.
          </p>
        </div>

        <div className="try__grid">
          <div className="try__panel try__panel--input">
            <label className="try__label" htmlFor="try-prompt">
              Prompt
            </label>
            <textarea
              id="try-prompt"
              className="try__textarea"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Refactor this useEffect to avoid stale closures…"
              spellCheck={false}
            />
            <div className="try__actions">
              <button type="button" className="btn btn--primary" onClick={run}>
                Route this prompt
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setPrompt('')
                  setResult(null)
                  setError(null)
                }}
              >
                Clear
              </button>
            </div>
            {error ? <p className="try__error">{error}</p> : null}
          </div>

          <div className="try__panel try__panel--out">
            {!result ? (
              <div className="try__placeholder">
                <p className="try__placeholder-title">No route yet</p>
                <p className="try__placeholder-text">
                  You’ll see a model pick, confidence, and <strong>illustrative</strong>{' '}
                  index savings vs our fixed 5-model fan-out baseline—not measured
                  usage or “prompts until happy.”
                </p>
              </div>
            ) : (
              <motion.div
                className="try__result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease }}
              >
                <div className="try__result-top">
                  <div>
                    <p className="try__meta">
                      {PROFILE_LABEL[result.taskProfile]} ·{' '}
                      {Math.round(result.confidence * 100)}% confidence
                    </p>
                    <p className="try__model">{result.chosen.name}</p>
                    <p className="try__provider">{result.chosen.provider}</p>
                  </div>
                  <span className="mock__badge">Routed</span>
                </div>
                <ul className="try__signals">
                  {result.signals.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {result.usdReference ? (
                  <p className="try__usd">
                    <strong>OpenRouter list $</strong> (synced{' '}
                    {new Date(
                      result.usdReference.pricingAsOf,
                    ).toLocaleDateString()}
                    ) for{' '}
                    {result.usdReference.referenceTokens.prompt} prompt +{' '}
                    {result.usdReference.referenceTokens.completion} completion
                    tokens: ~$
                    {result.usdReference.chosenUsd.toFixed(4)} this route vs ~$
                    {result.usdReference.fanoutSumUsd.toFixed(4)} running each of the
                    five fan-out models once — before discounts or your contract.
                  </p>
                ) : null}
                <div className="try__savings">
                  <div className="try__save">
                    <strong>−{result.savingsVsFanout.costPct}%</strong>
                    <span>
                      {result.usdReference
                        ? 'list $ vs sum of 5 fan-out runs (same token assumption)'
                        : `cost index vs ${result.fanoutModelCount}-model fan-out`}
                    </span>
                  </div>
                  <div className="try__save">
                    <strong>−{result.savingsVsFanout.energyPct}%</strong>
                    <span>energy index (not kWh measured)</span>
                  </div>
                  <div className="try__save">
                    <strong>−{result.savingsVsFanout.waterPct}%</strong>
                    <span>water index (not liters measured)</span>
                  </div>
                </div>
                <p className="try__disclaimer">
                  List $ is from OpenRouter’s public catalog, not your bill. We still
                  don’t know your discounts, region, or retries. Energy/water columns
                  are indices only—no API returns liters per token; serious footprint
                  work uses LCAs + your usage logs.
                </p>
                <p className="try__runners">
                  Runner-up:{' '}
                  {result.runnerUp.map((m) => m.name).join(' · ')}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
