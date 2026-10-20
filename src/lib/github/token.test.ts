import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getRateLimit, setRateLimit } from './rateLimit'
import {
  clearToken,
  getToken,
  getTokenState,
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

  it('starts empty and treats a stored token as remembered', () => {
    expect(getTokenState()).toEqual({ token: null, remembered: false })
    window.localStorage.setItem(TOKEN_STORAGE_KEY, ' ghp_abc ')
    resetTokenForTests()
    expect(getTokenState()).toEqual({ token: 'ghp_abc', remembered: true })
  })

  it('keeps the token in memory only by default', () => {
    setToken('ghp_mem')
    expect(getToken()).toBe('ghp_mem')
    expect(getTokenState().remembered).toBe(false)
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('persists only when asked, notifies and resets the quota state', () => {
    setRateLimit({ limit: 10, remaining: 3, resetAt: new Date(0) })
    const listener = vi.fn()
    const unsubscribe = subscribeToken(listener)
    setToken('ghp_new', { remember: true })
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('ghp_new')
    expect(listener).toHaveBeenCalledWith({ token: 'ghp_new', remembered: true })
    expect(getRateLimit()).toBeNull()
    unsubscribe()
  })

  it('clears memory and storage on remove', () => {
    setToken('ghp_new', { remember: true })
    clearToken()
    expect(getTokenState()).toEqual({ token: null, remembered: false })
    expect(window.localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })
})
