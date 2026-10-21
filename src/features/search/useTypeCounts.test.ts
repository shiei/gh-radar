import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_FILTERS, resetTokenForTests, setToken } from '../../lib/github'
import { clearTypeCountsCache, useTypeCounts } from './useTypeCounts'

/** fetch's first argument as a plain URL string. */
function urlOf(input: RequestInfo | URL | undefined): string {
  if (input === undefined) return ''
  if (typeof input === 'string') return input
  return input instanceof URL ? input.href : input.url
}

describe('useTypeCounts', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    resetTokenForTests()
    clearTypeCountsCache()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('sends nothing without a token', async () => {
    const { result } = renderHook(() => useTypeCounts('react', 'repositories', DEFAULT_FILTERS))
    await new Promise((r) => setTimeout(r, 20))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current).toEqual({})
  })

  it('fetches per_page=1 counts for the other two types when a token is set', async () => {
    setToken('ghp_test', { remember: false })
    fetchMock.mockImplementation((url) => {
      const total = urlOf(url).includes('/search/users') ? 12 : 34
      return Promise.resolve(
        new Response(JSON.stringify({ total_count: total, incomplete_results: false, items: [] })),
      )
    })
    const { result } = renderHook(() =>
      useTypeCounts('react', 'repositories', { ...DEFAULT_FILTERS, language: 'Go' }),
    )
    await waitFor(() => expect(result.current).toEqual({ users: 12, topics: 34 }))
    const urls = fetchMock.mock.calls.map((c) => urlOf(c[0])).sort()
    expect(urls).toEqual([
      'https://api.github.com/search/topics?q=react&per_page=1&page=1',
      'https://api.github.com/search/users?q=react&per_page=1&page=1',
    ])
  })

  it('composes filters into the repositories count and stays silent on failure', async () => {
    setToken('ghp_test', { remember: false })
    fetchMock.mockImplementation((url) =>
      Promise.resolve(
        urlOf(url).includes('/search/repositories')
          ? new Response(JSON.stringify({ total_count: 5, incomplete_results: false, items: [] }))
          : new Response('', { status: 500 }),
      ),
    )
    const { result } = renderHook(() =>
      useTypeCounts('react', 'users', { ...DEFAULT_FILTERS, minStars: 100 }),
    )
    await waitFor(() => expect(result.current).toEqual({ repositories: 5 }))
    expect(fetchMock.mock.calls.map((c) => urlOf(c[0]))).toContain(
      'https://api.github.com/search/repositories?q=react+stars%3A%3E%3D100&per_page=1&page=1',
    )
  })

  it('returns nothing for an empty query', () => {
    setToken('ghp_test', { remember: false })
    const { result } = renderHook(() => useTypeCounts('', 'repositories', DEFAULT_FILTERS))
    expect(result.current).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
