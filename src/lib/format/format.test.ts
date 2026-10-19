import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  formatTime,
  formatTimestamp,
} from './index'

const LANGS = ['en', 'ja', 'zh'] as const

describe('format helpers', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date('2026-10-19T12:00:00Z') }))
  afterEach(() => vi.useRealTimers())

  it.each(LANGS)('formatCompactNumber(12800, %s) is short and contains a digit', (lang) => {
    const out = formatCompactNumber(12800, lang)
    expect(out.length).toBeLessThan(8)
    expect(out).toMatch(/\d/)
  })

  it('formatCompactNumber uses K in English', () => {
    expect(formatCompactNumber(12800, 'en')).toBe('12.8K')
  })

  it('formatNumber groups thousands in English', () => {
    expect(formatNumber(120000, 'en')).toBe('120,000')
  })

  it.each(LANGS)('formatRelativeTime for 3 days ago in %s mentions 3', (lang) => {
    const out = formatRelativeTime('2026-10-16T12:00:00Z', lang, new Date())
    expect(out).toContain('3')
  })

  it('formatRelativeTime picks sensible units in English', () => {
    expect(formatRelativeTime('2026-10-16T12:00:00Z', 'en')).toBe('3 days ago')
    expect(formatRelativeTime('2026-10-19T09:00:00Z', 'en')).toBe('3 hours ago')
    expect(formatRelativeTime('2025-08-19T12:00:00Z', 'en')).toBe('last year')
    expect(formatRelativeTime('2026-10-19T11:59:50Z', 'en')).toBe('now')
  })

  it('formatTimestamp is relative within 30 days and absolute beyond', () => {
    expect(formatTimestamp('2026-10-16T12:00:00Z', 'en')).toBe('3 days ago')
    expect(formatTimestamp('2026-09-19T12:00:00Z', 'en')).toBe('last month')
    expect(formatTimestamp('2026-09-18T12:00:00Z', 'en')).toBe('Sep 18, 2026')
    expect(formatTimestamp('2025-03-04T12:00:00Z', 'en')).toBe('Mar 4, 2025')
  })

  it('formatDate is localised', () => {
    expect(formatDate('2025-03-04T12:00:00Z', 'zh')).toBe('2025年3月4日')
    expect(formatDate('2025-03-04T12:00:00Z', 'ja')).toBe('2025年3月4日')
    expect(formatDate('2025-03-04T12:00:00Z', 'en')).toBe('Mar 4, 2025')
  })

  it.each(LANGS)('formatDateTime in %s includes the year and the minute', (lang) => {
    const out = formatDateTime('2025-03-04T14:32:00Z', lang)
    expect(out).toContain('2025')
    expect(out).toMatch(/32/)
  })

  it.each(LANGS)('formatTime in %s contains hour and minute', (lang) => {
    const out = formatTime(new Date('2026-10-19T14:32:00Z'), lang)
    expect(out).toMatch(/32/)
  })
})
