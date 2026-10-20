import { setRateLimit } from './rateLimit'

export const TOKEN_STORAGE_KEY = 'osr.token'

export interface TokenState {
  token: string | null
  /** True when the token is also written to localStorage ("remember on this device"). */
  remembered: boolean
}

type Listener = (state: TokenState) => void
const listeners = new Set<Listener>()

function readStored(): string | null {
  try {
    const trimmed = window.localStorage.getItem(TOKEN_STORAGE_KEY)?.trim()
    if (!trimmed) return null
    return trimmed
  } catch {
    return null
  }
}

let current: TokenState | undefined

function state(): TokenState {
  if (current === undefined) {
    const stored = readStored()
    current = { token: stored, remembered: stored !== null }
  }
  return current
}

/** The active token, or null. Lives in memory; on disk only when the user chose to remember it. */
export function getToken(): string | null {
  return state().token
}

export function getTokenState(): TokenState {
  return state()
}

function notify() {
  const snapshot = state()
  for (const listener of listeners) listener(snapshot)
}

/**
 * Activate a token. By default it is kept in memory only and gone when the tab closes;
 * `remember` persists it in this browser's localStorage. Quota resets to unknown.
 */
export function setToken(token: string, options: { remember?: boolean } = {}): void {
  const trimmed = token.trim()
  const remember = Boolean(options.remember) && trimmed !== ''
  current = { token: trimmed || null, remembered: remember }
  try {
    if (remember) window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed)
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
