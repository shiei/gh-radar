export interface RateLimit {
  remaining: number
  resetAt: Date
}

type Listener = (state: RateLimit | null) => void

/** Null means unknown (no response seen yet, or headers missing). */
let current: RateLimit | null = null
const listeners = new Set<Listener>()

/** Parse X-RateLimit-* headers. Returns null when either is missing or malformed. */
export function parseRateLimit(headers: Headers): RateLimit | null {
  const remainingRaw = headers.get('x-ratelimit-remaining')
  const resetRaw = headers.get('x-ratelimit-reset')
  if (remainingRaw === null || resetRaw === null) return null
  const remaining = Number(remainingRaw)
  const resetEpoch = Number(resetRaw)
  if (!Number.isFinite(remaining) || !Number.isFinite(resetEpoch)) return null
  return { remaining, resetAt: new Date(resetEpoch * 1000) }
}

export function getRateLimit(): RateLimit | null {
  return current
}

export function setRateLimit(next: RateLimit | null): void {
  current = next
  for (const listener of listeners) listener(current)
}

export function subscribeRateLimit(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
