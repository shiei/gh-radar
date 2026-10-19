import { describe, expect, it } from 'vitest'

import { activityOf, starsPerMonth } from './signals'

const now = new Date('2026-10-19T12:00:00Z')

describe('activityOf', () => {
  it('classifies by days since last push', () => {
    expect(activityOf('2026-10-10T00:00:00Z', now)).toBe('active')
    expect(activityOf('2026-07-01T00:00:00Z', now)).toBe('quiet')
    expect(activityOf('2025-01-01T00:00:00Z', now)).toBe('inactive')
  })
})

describe('starsPerMonth', () => {
  it('divides stars by months since creation, with a one month floor', () => {
    expect(starsPerMonth(1200, '2025-10-19T12:00:00Z', now)).toBeCloseTo(1200 / 12.17, 0)
    expect(starsPerMonth(500, '2026-10-15T00:00:00Z', now)).toBe(500)
  })
})
