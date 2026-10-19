import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRateLimit, parseRateLimit, setRateLimit, subscribeRateLimit } from './rateLimit'

describe('parseRateLimit', () => {
  it('reads remaining and reset when both headers are present', () => {
    const headers = new Headers({ 'x-ratelimit-remaining': '7', 'x-ratelimit-reset': '1760000000' })
    expect(parseRateLimit(headers)).toEqual({ remaining: 7, resetAt: new Date(1760000000 * 1000) })
  })

  it('returns null when a header is missing', () => {
    expect(parseRateLimit(new Headers())).toBeNull()
    expect(parseRateLimit(new Headers({ 'x-ratelimit-remaining': '7' }))).toBeNull()
  })

  it('returns null when a header is not numeric', () => {
    const headers = new Headers({ 'x-ratelimit-remaining': 'abc', 'x-ratelimit-reset': '1' })
    expect(parseRateLimit(headers)).toBeNull()
  })
})

describe('rate limit state', () => {
  beforeEach(() => setRateLimit(null))

  it('stores the latest value and notifies subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeRateLimit(listener)
    const value = { remaining: 3, resetAt: new Date(0) }
    setRateLimit(value)
    expect(getRateLimit()).toBe(value)
    expect(listener).toHaveBeenCalledWith(value)
    unsubscribe()
    setRateLimit(null)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
