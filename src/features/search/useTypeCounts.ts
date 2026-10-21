import { useEffect, useState, useSyncExternalStore } from 'react'

import {
  buildSearchPath,
  getToken,
  SEARCH_TYPES,
  subscribeToken,
  type SearchFilters,
  type SearchType,
} from '../../lib/github'
import { request } from '../../lib/github/request'

export type TypeCounts = Partial<Record<SearchType, number>>

const cache = new Map<string, number>()

export function clearTypeCountsCache() {
  cache.clear()
}

/**
 * Match counts for the search types other than the active one, shown on the type
 * tabs. Costs one extra request per type, so it only runs when a token is set;
 * without one the quota is too small to spend on decoration. Failures are silent.
 */
export function useTypeCounts(
  query: string,
  activeType: SearchType,
  filters: SearchFilters,
): TypeCounts {
  const token = useSyncExternalStore(subscribeToken, getToken, () => null)
  const [counts, setCounts] = useState<TypeCounts>({})
  const [countsFor, setCountsFor] = useState('')

  const key = token && query ? `${query}|${activeType}|${JSON.stringify(filters)}` : ''
  // The counts shown must belong to the current query; drop stale ones during render.
  if (key !== countsFor) {
    setCountsFor(key)
    setCounts({})
  }

  useEffect(() => {
    if (!key) return
    const controller = new AbortController()
    const others = SEARCH_TYPES.filter((type) => type !== activeType)
    void Promise.all(
      others.map(async (type) => {
        const path = buildSearchPath({ type, query, sort: 'best', page: 1, filters, perPage: 1 })
        const hit = cache.get(path)
        if (hit !== undefined) return [type, hit] as const
        const result = await request<{ total_count: number }>(path, { signal: controller.signal })
        if (!result.ok) return null
        cache.set(path, result.data.total_count)
        return [type, result.data.total_count] as const
      }),
    ).then((pairs) => {
      if (controller.signal.aborted) return
      const next: TypeCounts = {}
      for (const pair of pairs) if (pair) next[pair[0]] = pair[1]
      setCounts(next)
    })
    return () => controller.abort()
    // query/activeType/filters are folded into key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return counts
}
