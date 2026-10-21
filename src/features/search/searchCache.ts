import type { AnySearchResult, SearchRequest } from '../../lib/github'
import { composeQuery } from '../../lib/github'

export const CACHE_TTL_MS = 5 * 60 * 1000
export const CACHE_MAX_ENTRIES = 50

interface Entry {
  result: AnySearchResult
  storedAt: number
}

const entries = new Map<string, Entry>()

/** Type, the query as sent (filters composed in), sort and page. */
export function cacheKey({ type, query, sort, page, filters }: SearchRequest): string {
  const sent = type === 'repositories' ? composeQuery(query, filters) : query.trim()
  return `${type}|${sent}|${type === 'repositories' ? sort : 'best'}|${String(page)}`
}

/** A fresh cached result for this request, or null. Expired entries are dropped. */
export function getCached(req: SearchRequest, now: number = Date.now()): AnySearchResult | null {
  const key = cacheKey(req)
  const entry = entries.get(key)
  if (!entry) return null
  if (now - entry.storedAt > CACHE_TTL_MS) {
    entries.delete(key)
    return null
  }
  return entry.result
}

export function setCached(req: SearchRequest, result: AnySearchResult, now: number = Date.now()) {
  const key = cacheKey(req)
  entries.delete(key)
  entries.set(key, { result, storedAt: now })
  while (entries.size > CACHE_MAX_ENTRIES) {
    const oldest = entries.keys().next().value
    if (oldest === undefined) break
    entries.delete(oldest)
  }
}

export function invalidateCached(req: SearchRequest) {
  entries.delete(cacheKey(req))
}

export function clearSearchCache() {
  entries.clear()
}
