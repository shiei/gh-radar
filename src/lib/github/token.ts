import { setRateLimit } from './rateLimit'

export const TOKEN_STORAGE_KEY = 'osr.token'

type Listener = (token: string | null) => void
const listeners = new Set<Listener>()

function read(): string | null {
  try {
    const trimmed = window.localStorage.getItem(TOKEN_STORAGE_KEY)?.trim()
    if (!trimmed) return null
    return trimmed
  } catch {
    return null
  }
}

let current: string | null | undefined

/** The saved personal token, or null. Read lazily once, then kept in memory. */
export function getToken(): string | null {
  if (current === undefined) current = read()
  return current
}

function notify() {
  for (const listener of listeners) listener(current ?? null)
}

/** Persist a token. Quota state resets to unknown until the next response. */
export function setToken(token: string): void {
  const trimmed = token.trim()
  current = trimmed || null
  try {
    if (current) window.localStorage.setItem(TOKEN_STORAGE_KEY, current)
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Storage unavailable: the token still works for this session.
  }
  setRateLimit(null)
  notify()
}

export function clearToken(): void {
  setToken('')
}

export function subscribeToken(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Test helper: forget the in-memory copy so the next read hits storage. */
export function resetTokenForTests(): void {
  current = undefined
}
