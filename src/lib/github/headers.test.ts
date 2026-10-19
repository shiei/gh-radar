import { describe, expect, it } from 'vitest'

import { buildHeaders } from './headers'

describe('buildHeaders', () => {
  it('sends exactly Accept and the API version, never Authorization', () => {
    const headers = buildHeaders()
    expect(Object.keys(headers).sort()).toEqual(['Accept', 'X-GitHub-Api-Version'])
    expect(headers.Accept).toBe('application/vnd.github+json')
    expect(headers['X-GitHub-Api-Version']).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect('Authorization' in headers).toBe(false)
  })
})
