import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getRateLimit, setRateLimit } from './rateLimit'
import { request } from './request'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  })
}

const fetchMock = vi.fn<typeof fetch>()

describe('request', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
    setRateLimit(null)
    vi.useFakeTimers({ now: new Date('2026-10-19T12:00:00Z') })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('calls api.github.com with the standard headers and no Authorization', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ hello: 1 }))
    const result = await request<{ hello: number }>('/search/repositories?q=x')
    expect(result).toEqual({ ok: true, data: { hello: 1 } })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.github.com/search/repositories?q=x')
    const headers = init?.headers as Record<string, string>
    expect(headers.Accept).toBe('application/vnd.github+json')
    expect(headers.Authorization).toBeUndefined()
  })

  it('records rate limit headers on success', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {},
        { headers: { 'x-ratelimit-remaining': '9', 'x-ratelimit-reset': '1760000000' } },
      ),
    )
    await request('/x')
    expect(getRateLimit()).toEqual({ remaining: 9, resetAt: new Date(1760000000 * 1000) })
  })

  it('records rate limit headers on failure too', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {},
        { status: 500, headers: { 'x-ratelimit-remaining': '5', 'x-ratelimit-reset': '1' } },
      ),
    )
    await request('/x')
    expect(getRateLimit()?.remaining).toBe(5)
  })

  it('403 with remaining 0 is rate_limited with reset from X-RateLimit-Reset', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {},
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1760000000' },
        },
      ),
    )
    const result = await request('/x')
    expect(result).toEqual({
      ok: false,
      error: { kind: 'rate_limited', resetAt: new Date(1760000000 * 1000) },
    })
  })

  it('403 with Retry-After is rate_limited and Retry-After wins', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {},
        { status: 403, headers: { 'retry-after': '60', 'x-ratelimit-reset': '1760000000' } },
      ),
    )
    const result = await request('/x')
    expect(result).toEqual({
      ok: false,
      error: { kind: 'rate_limited', resetAt: new Date('2026-10-19T12:01:00Z') },
    })
  })

  it('403 without rate limit signals is a plain api error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 403 }))
    expect(await request('/x')).toEqual({ ok: false, error: { kind: 'api', status: 403 } })
  })

  it('429 without headers is rate_limited with unknown reset', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 429 }))
    expect(await request('/x')).toEqual({
      ok: false,
      error: { kind: 'rate_limited', resetAt: null },
    })
  })

  it('422 is invalid_query', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 422 }))
    expect(await request('/x')).toEqual({ ok: false, error: { kind: 'invalid_query' } })
  })

  it('other non-2xx is api with the status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 503 }))
    expect(await request('/x')).toEqual({ ok: false, error: { kind: 'api', status: 503 } })
  })

  it('a thrown fetch is network', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    expect(await request('/x')).toEqual({ ok: false, error: { kind: 'network' } })
  })

  it('an aborted fetch is aborted and does not touch rate limit state', async () => {
    const before = { remaining: 42, resetAt: new Date(0) }
    setRateLimit(before)
    fetchMock.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'))
    expect(await request('/x', { signal: new AbortController().signal })).toEqual({
      ok: false,
      error: { kind: 'aborted' },
    })
    expect(getRateLimit()).toBe(before)
  })
})
