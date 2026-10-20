import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRateLimit, setRateLimit } from './rateLimit'
import {
  clearToken,
  getToken,
  resetTokenForTests,
  setToken,
  subscribeToken,
  TOKEN_STORAGE_KEY,
} from './token'

describe('token store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetTokenForTests()
    setRateLimit(null)
  })

  it('starts empty and reads a stored token lazily', () => {
    expect(getToken()).toBeNull()
    window.localStorage.setItem(TOKEN_STORAGE_KEY, ' ghp_abc ')
    resetTokenForTests()
    expect(getToken()).toBe('ghp_abc')
  })

  it('persists, notifies and resets the quota state', () => {
    setRateLimit({ limit: 10, remaining: 3, resetAt: new Date(0) })
    const listener = vi.fn()
    const unsubscribe = subscribeToken(listener)
    setToken('ghp_new')
    expect(getToken()).toBe('ghp_new')
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('ghp_new')
    expect(listener).toHaveBeenCalledWith('ghp_new')
    expect(getRateLimit()).toBeNull()
    unsubscribe()
  })

  it('clears storage on remove', () => {
    setToken('ghp_new')
    clearToken()
    expect(getToken()).toBeNull()
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })
})
