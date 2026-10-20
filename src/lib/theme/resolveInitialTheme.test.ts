import { describe, expect, it } from 'vitest'

import { resolveInitialTheme } from './resolveInitialTheme'

describe('resolveInitialTheme', () => {
  it('uses a stored choice', () => {
    expect(resolveInitialTheme('light')).toBe('light')
    expect(resolveInitialTheme('dark')).toBe('dark')
  })

  it('defaults to dark regardless of the system preference', () => {
    expect(resolveInitialTheme(null)).toBe('dark')
    expect(resolveInitialTheme(null)).toBe('dark')
    expect(resolveInitialTheme(undefined)).toBe('dark')
  })

  it('ignores invalid stored values', () => {
    expect(resolveInitialTheme('blue')).toBe('dark')
    expect(resolveInitialTheme(42)).toBe('dark')
  })
})
