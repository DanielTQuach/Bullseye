import { track as vercelTrack } from '@vercel/analytics'

/**
 * Privacy-first: never send prompt contents.
 * - Vercel Web Analytics custom events (enable Analytics in your Vercel project).
 * - Optional `VITE_ANALYTICS_WEBHOOK` for your own HTTPS ingest (JSON POST / sendBeacon).
 */
const WEBHOOK = import.meta.env.VITE_ANALYTICS_WEBHOOK as string | undefined

export function trackEvent(
  name: string,
  props: Record<string, string | number | boolean | null | undefined>,
): void {
  const clean: Record<string, string | number | boolean | null | undefined> = {}
  for (const [k, v] of Object.entries(props)) {
    if (v !== undefined) clean[k] = v
  }

  try {
    vercelTrack(name, clean as Record<string, string | number | boolean | null>)
  } catch {
    /* no-op if script not injected */
  }

  if (typeof window === 'undefined') return
  if (!WEBHOOK || !WEBHOOK.startsWith('https://')) return

  const body = JSON.stringify({
    event: name,
    ...clean,
    ts: Date.now(),
    path: window.location.pathname,
  })
  try {
    navigator.sendBeacon(WEBHOOK, body)
  } catch {
    void fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
  }
}
