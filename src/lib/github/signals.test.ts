import { describe, expect, it } from 'vitest'

import { activityOf } from './signals'

const now = new Date('2026-10-19T12:00:00Z')

describe('activityOf', () => {
  it('classifies by days since last push', () => {
    expect(activityOf('2026-10-10T00:00:00Z', now)).toBe('active')
    expect(activityOf('2026-07-01T00:00:00Z', now)).toBe('quiet')
    expect(activityOf('2025-01-01T00:00:00Z', now)).toBe('inactive')
  })
})
