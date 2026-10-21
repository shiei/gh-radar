import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AnySearchResult } from '../../lib/github'
import { clearSearchCache } from './searchCache'
import { useRepositorySearch } from './useRepositorySearch'

interface Deferred {
  resolve: (r: Response) => void
  reject: (e: unknown) => void
  signal?: AbortSignal
}

function payload(name: string, total = 1) {
  return JSON.stringify({
    total_count: total,
    incomplete_results: false,
    items: [
      {
        id: 1,
        name,
        full_name: `o/${name}`,
        html_url: `https://github.com/o/${name}`,
        description: null,
        stargazers_count: 1,
        language: null,
        updated_at: '2026-01-01T00:00:00Z',
        topics: [],
        license: null,
        owner: { login: 'o' },
        pushed_at: '2026-01-01T00:00:00Z',
        created_at: '2020-01-01T00:00:00Z',
      },
    ],
  })
}

function firstName(result: AnySearchResult | null): string | undefined {
  return result?.type === 'repositories' ? result.items[0]?.name : undefined
}

/** fetch's first argument as a plain URL string. */
function urlOf(input: RequestInfo | URL | undefined): string {
  if (input === undefined) return ''
  if (typeof input === 'string') return input
  return input instanceof URL ? input.href : input.url
}

describe('useRepositorySearch', () => {
  const pending: Deferred[] = []
  const fetchMock = vi.fn<typeof fetch>((_url, init) => {
    return new Promise<Response>((resolve, reject) => {
      const entry: Deferred = { resolve, reject, signal: init?.signal ?? undefined }
      entry.signal?.addEventListener('abort', () =>
        reject(new DOMException('aborted', 'AbortError')),
      )
      pending.push(entry)
    })
  })

  beforeEach(() => {
    clearSearchCache()
    pending.length = 0
    fetchMock.mockClear()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('drops the stale response when a new search starts while loading', async () => {
    const { result } = renderHook(() => useRepositorySearch())
    act(() => result.current.submit('react'))
    act(() => result.current.submit('vue'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(pending[0]?.signal?.aborted).toBe(true)

    // Late "react" response arrives after "vue"'s is already resolved.
    pending[1]!.resolve(new Response(payload('vue'), { status: 200 }))
    await waitFor(() => expect(result.current.state.status).toBe('success'))
    pending[0]!.resolve(new Response(payload('react'), { status: 200 }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(firstName(result.current.state.result)).toBe('vue')
    expect(result.current.state.query).toBe('vue')
  })

  it('retry re-sends the same query, sort and page', async () => {
    const { result } = renderHook(() => useRepositorySearch())
    act(() => result.current.setSort('stars'))
    act(() => result.current.submit('react'))
    pending[0]!.resolve(new Response('{}', { status: 503 }))
    await waitFor(() => expect(result.current.state.status).toBe('error'))

    act(() => result.current.retry())
    const [firstUrl] = fetchMock.mock.calls[0]!
    const [retryUrl] = fetchMock.mock.calls[1]!
    expect(retryUrl).toBe(firstUrl)
    expect(retryUrl).toContain('sort=stars')
    expect(result.current.state.status).toBe('loading')
  })

  it('answers repeated params from the session cache without a request', async () => {
    const { result } = renderHook(() => useRepositorySearch())
    act(() => result.current.submit('react'))
    pending[0]!.resolve(new Response(payload('react', 50), { status: 200 }))
    await waitFor(() => expect(result.current.state.status).toBe('success'))
    act(() => result.current.goToPage(2))
    pending[1]!.resolve(new Response(payload('react-p2', 50), { status: 200 }))
    await waitFor(() => expect(result.current.state.page).toBe(2))
    expect(fetchMock).toHaveBeenCalledTimes(2)

    act(() => result.current.goToPage(1))
    await waitFor(() => expect(result.current.state.page).toBe(1))
    expect(result.current.state.status).toBe('success')
    expect(firstName(result.current.state.result)).toBe('react')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('marks zero results as empty', async () => {
    const { result } = renderHook(() => useRepositorySearch())
    act(() => result.current.submit('zzz'))
    pending[0]!.resolve(
      new Response(JSON.stringify({ total_count: 0, incomplete_results: false, items: [] })),
    )
    await waitFor(() => expect(result.current.state.status).toBe('empty'))
  })
})

describe('useRepositorySearch types and filters', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    clearSearchCache()
    fetchMock.mockReset()
    // A Response body can be read once, so build a fresh one per call.
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ total_count: 0, incomplete_results: false, items: [] })),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('switching type hits that type endpoint with the plain query', async () => {
    const { result } = renderHook(() => useRepositorySearch())
    act(() => result.current.setFilters({ language: 'Go' }))
    act(() => result.current.submit('react'))
    await waitFor(() => expect(result.current.state.status).toBe('empty'))
    expect(urlOf(fetchMock.mock.calls[0]?.[0])).toBe(
      'https://api.github.com/search/repositories?q=react+language%3AGo&per_page=10&page=1',
    )
    act(() => result.current.setType('users'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(urlOf(fetchMock.mock.calls[1]?.[0])).toBe(
      'https://api.github.com/search/users?q=react&per_page=10&page=1',
    )
    await waitFor(() => expect(result.current.state.result?.type).toBe('users'))
  })

  it('submit with a type switches back to repositories', async () => {
    const { result } = renderHook(() => useRepositorySearch())
    act(() => result.current.setType('topics'))
    act(() => result.current.submit('react'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(urlOf(fetchMock.mock.calls[0]?.[0])).toContain('/search/topics?')
    act(() => result.current.submit('topic:react', 'repositories'))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(urlOf(fetchMock.mock.calls[1]?.[0])).toContain('/search/repositories?q=topic%3Areact')
    expect(result.current.state.type).toBe('repositories')
  })
})
