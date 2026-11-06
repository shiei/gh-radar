import { CONSENT_STORAGE_KEY, isConsent, type Consent } from './constants'

type Listener = () => void

export type ConsentStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/**
 * Holds the visitor's cookie decision: `granted`, `denied`, or `null` while they have not
 * answered yet. Persisted to storage when one is available; works in memory otherwise.
 */
export interface ConsentStore {
  get: (this: void) => Consent | null
  set: (this: void, next: Consent | null) => void
  subscribe: (this: void, listener: Listener) => () => void
}

function readStorage(storage: ConsentStorage | null, key: string): Consent | null {
  if (!storage) return null
  try {
    const stored = storage.getItem(key)
    return isConsent(stored) ? stored : null
  } catch {
    return null
  }
}

function writeStorage(storage: ConsentStorage | null, key: string, value: Consent | null) {
  if (!storage) return
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, value)
  } catch {
    // Storage may be unavailable (private mode, blocked). The in-memory value still applies.
  }
}

export function createConsentStore(
  storage: ConsentStorage | null,
  key: string = CONSENT_STORAGE_KEY,
): ConsentStore {
  let current = readStorage(storage, key)
  const listeners = new Set<Listener>()
  return {
    get: () => current,
    set: (next) => {
      if (next === current) return
      current = next
      writeStorage(storage, key, next)
      for (const listener of listeners) listener()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

function browserStorage(): ConsentStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** The store the app uses. Tests build their own with `createConsentStore`. */
export const consentStore: ConsentStore = createConsentStore(browserStorage())
