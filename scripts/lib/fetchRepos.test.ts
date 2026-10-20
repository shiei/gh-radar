import { describe, expect, it, vi } from 'vitest'

import { createClient, SnapshotFetchError } from './fetchRepos'

function response(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(body === null ? null : JSON.stringify(body), { status, headers })
}
const items = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    full_name: `o/r${String(i)}`,
    stargazers_count: 1,
    pushed_at: '',
    created_at: '',
  }))

describe('createClient', () => {
  it('paginates until a short page and sends the token', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(200, { items: items(100) }))
      .mockResolvedValueOnce(response(200, { items: items(40) }))
    const client = createClient({ fetchImpl, token: 'tok', sleep: () => Promise.resolve() })
    const out = await client.searchAll('topic:x', 3)
    expect(out).toHaveLength(140)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const [firstUrl, firstInit] = fetchImpl.mock.calls[0] ?? []
    const [secondUrl] = fetchImpl.mock.calls[1] ?? []
    expect(typeof firstUrl).toBe('string')
    const headers = firstInit?.headers as Record<string, string> | undefined
    expect(headers?.Authorization).toBe('Bearer tok')
    expect(typeof secondUrl === 'string' && secondUrl.includes('page=2')).toBe(true)
  })

  it('stops at 422 (end of the 1000-result window)', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(200, { items: items(100) }))
      .mockResolvedValueOnce(response(422, { message: 'Only the first 1000' }))
    const client = createClient({ fetchImpl, sleep: () => Promise.resolve() })
    expect(await client.searchAll('q', 3)).toHaveLength(100)
  })

  it('waits for the reset time when the quota hits zero', async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(() => Promise.resolve())
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        response(
          200,
          { items: items(100) },
          { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1000' },
        ),
      )
      .mockResolvedValueOnce(response(200, { items: items(1) }))
    const client = createClient({ fetchImpl, sleep, now: () => 990_000 })
    await client.searchAll('q', 3)
    expect(sleep).toHaveBeenCalledWith(11_000)
  })

  it('retries 5xx with backoff then fails', async () => {
    const sleep = vi.fn<(ms: number) => Promise<void>>(() => Promise.resolve())
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(response(503, null))
    const client = createClient({ fetchImpl, sleep, maxRetries: 2 })
    await expect(client.searchAll('q', 1)).rejects.toBeInstanceOf(SnapshotFetchError)
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([1000, 2000])
  })

  it('returns null for a missing watchlist repo', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(404, { message: 'nope' }))
    const client = createClient({ fetchImpl, sleep: () => Promise.resolve() })
    expect(await client.getRepo('gone/repo')).toBeNull()
  })
})
