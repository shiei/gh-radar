import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_FILTERS, type AnySearchResult } from '../../lib/github'
import {
  CACHE_MAX_ENTRIES,
  CACHE_TTL_MS,
  clearSearchCache,
  getCached,
  invalidateCached,
  setCached,
} from './searchCache'

const result = (n: number): AnySearchResult => ({
  type: 'repositories',
  totalCount: n,
  incompleteResults: false,
  items: [],
})
const params = (query: string, page = 1) => ({
  type: 'repositories' as const,
  query,
  sort: 'best' as const,
  page,
  filters: DEFAULT_FILTERS,
})

describe('searchCache', () => {
  beforeEach(() => clearSearchCache())

  it('returns a fresh entry and misses after the TTL', () => {
    setCached(params('react'), result(1), 1000)
    expect(getCached(params('react'), 1000 + CACHE_TTL_MS)).toEqual(result(1))
    expect(getCached(params('react'), 1000 + CACHE_TTL_MS + 1)).toBeNull()
  })

  it('keys by type, query, sort, filters and page', () => {
    setCached(params('react', 1), result(1))
    expect(getCached(params('react', 2))).toBeNull()
    expect(getCached({ ...params('react'), sort: 'stars' })).toBeNull()
    expect(getCached({ ...params('react'), type: 'users' })).toBeNull()
    expect(
      getCached({ ...params('react'), filters: { ...DEFAULT_FILTERS, minStars: 100 } }),
    ).toBeNull()
  })

  it('evicts the oldest entries beyond the cap', () => {
    for (let i = 0; i < CACHE_MAX_ENTRIES + 5; i += 1) setCached(params(`q${String(i)}`), result(i))
    expect(getCached(params('q0'))).toBeNull()
    expect(getCached(params('q4'))).toBeNull()
    expect(getCached(params('q5'))).toEqual(result(5))
  })

  it('invalidates a single key', () => {
    setCached(params('react'), result(1))
    invalidateCached(params('react'))
    expect(getCached(params('react'))).toBeNull()
  })
})
