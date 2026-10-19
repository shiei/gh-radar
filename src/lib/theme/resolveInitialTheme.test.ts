import { describe, expect, it } from 'vitest'

import { resolveInitialTheme } from './resolveInitialTheme'

describe('resolveInitialTheme', () => {
  it('prefers a stored choice over the system preference', () => {
    expect(resolveInitialTheme('light', true)).toBe('light')
    expect(resolveInitialTheme('dark', false)).toBe('dark')
  })

  it('follows the system preference when nothing is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
    expect(resolveInitialTheme(undefined, false)).toBe('light')
  })

  it('defaults to light when the system preference is unknown', () => {
    expect(resolveInitialTheme(null, null)).toBe('light')
  })

  it('ignores invalid stored values', () => {
    expect(resolveInitialTheme('blue', true)).toBe('dark')
    expect(resolveInitialTheme(42, null)).toBe('light')
  })
})
