import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getRateLimit, setRateLimit } from './rateLimit'
import { validateToken } from './validateToken'

describe('validateToken', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    setRateLimit(null)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('sends the candidate token and records the search quota on 200', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ resources: { search: { limit: 30, remaining: 28, reset: 1760000000 } } }),
        { status: 200 },
      ),
    )
    const result = await validateToken('ghp_candidate')
    expect(result.ok).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.github.com/rate_limit')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer ghp_candidate')
    expect(getRateLimit()).toEqual({
      limit: 30,
      remaining: 28,
      resetAt: new Date(1760000000 * 1000),
    })
  })

  it('reports invalid_token on 401 and leaves quota untouched', async () => {
    const before = { limit: 10, remaining: 9, resetAt: new Date(0) }
    setRateLimit(before)
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 }))
    expect(await validateToken('bad')).toEqual({ ok: false, error: { kind: 'invalid_token' } })
    expect(getRateLimit()).toBe(before)
  })

  it('maps other failures like the request layer', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 503 }))
    expect(await validateToken('x')).toEqual({ ok: false, error: { kind: 'api', status: 503 } })
    fetchMock.mockRejectedValue(new TypeError('offline'))
    expect(await validateToken('x')).toEqual({ ok: false, error: { kind: 'network' } })
  })
})
