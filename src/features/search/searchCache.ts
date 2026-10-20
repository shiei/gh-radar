import type { SearchParams, SearchResult } from '../../lib/github'

export const CACHE_TTL_MS = 5 * 60 * 1000
export const CACHE_MAX_ENTRIES = 50

interface Entry {
  result: SearchResult
  storedAt: number
}

const entries = new Map<string, Entry>()

export function cacheKey({ query, sort, page }: SearchParams): string {
  return `${query}|${sort}|${String(page)}`
}

/** A fresh cached result for these params, or null. Expired entries are dropped. */
export function getCached(params: SearchParams, now: number = Date.now()): SearchResult | null {
  const key = cacheKey(params)
  const entry = entries.get(key)
  if (!entry) return null
  if (now - entry.storedAt > CACHE_TTL_MS) {
    entries.delete(key)
    return null
  }
  return entry.result
}

export function setCached(params: SearchParams, result: SearchResult, now: number = Date.now()) {
  const key = cacheKey(params)
  entries.delete(key)
  entries.set(key, { result, storedAt: now })
  while (entries.size > CACHE_MAX_ENTRIES) {
    const oldest = entries.keys().next().value
    if (oldest === undefined) break
    entries.delete(oldest)
  }
}

export function invalidateCached(params: SearchParams) {
  entries.delete(cacheKey(params))
}

export function clearSearchCache() {
  entries.clear()
}
