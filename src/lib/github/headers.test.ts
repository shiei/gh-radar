import { beforeEach, describe, expect, it } from 'vitest'

import { buildHeaders } from './headers'
import { resetTokenForTests, setToken } from './token'

describe('buildHeaders', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetTokenForTests()
  })

  it('sends exactly Accept and the API version when no token is saved', () => {
    const headers = buildHeaders()
    expect(Object.keys(headers).sort()).toEqual(['Accept', 'X-GitHub-Api-Version'])
    expect(headers.Accept).toBe('application/vnd.github+json')
    expect(headers['X-GitHub-Api-Version']).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('adds a Bearer Authorization header when a token is saved', () => {
    setToken('ghp_secret')
    expect(buildHeaders().Authorization).toBe('Bearer ghp_secret')
  })

  it('accepts an explicit token for validation calls', () => {
    expect(buildHeaders('candidate').Authorization).toBe('Bearer candidate')
    expect(buildHeaders(null).Authorization).toBeUndefined()
  })
})
