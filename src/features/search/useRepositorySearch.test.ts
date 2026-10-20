import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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
    expect(result.current.state.result?.items[0]?.name).toBe('vue')
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
    expect(result.current.state.result?.items[0]?.name).toBe('react')
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
