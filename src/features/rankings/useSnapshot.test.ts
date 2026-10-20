import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resetSnapshotCache, useSnapshot } from './useSnapshot'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const urlOf = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

describe('useSnapshot', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    resetSnapshotCache()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('is ready with age and staleness, and loads once for several callers', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-25T12:00:00Z'), toFake: ['Date'] })
    fetchMock.mockImplementation((input) => {
      const url = urlOf(input)
      if (url.endsWith('/meta.json'))
        return Promise.resolve(
          json({ date: '2026-10-20', lastRun: '', total: 0, sources: {}, mapVersion: 1 }),
        )
      if (url.endsWith('/latest.json'))
        return Promise.resolve(json({ date: '2026-10-20', repos: {} }))
      return Promise.resolve(json({}, 404))
    })
    const a = renderHook(() => useSnapshot())
    const b = renderHook(() => useSnapshot())
    await waitFor(() => expect(a.result.current.status).toBe('ready'))
    await waitFor(() => expect(b.result.current.status).toBe('ready'))
    if (a.result.current.status === 'ready') {
      expect(a.result.current.ageDays).toBe(5)
      expect(a.result.current.stale).toBe(true)
    }
    const metaCalls = fetchMock.mock.calls.filter((c) => urlOf(c[0]).endsWith('/meta.json'))
    expect(metaCalls).toHaveLength(1)
    vi.useRealTimers()
  })

  it('reports missing and error', async () => {
    fetchMock.mockResolvedValue(json({}, 404))
    const { result } = renderHook(() => useSnapshot())
    await waitFor(() => expect(result.current.status).toBe('missing'))
    resetSnapshotCache()
    fetchMock.mockResolvedValue(json({}, 500))
    const second = renderHook(() => useSnapshot())
    await waitFor(() => expect(second.result.current.status).toBe('error'))
  })
})
