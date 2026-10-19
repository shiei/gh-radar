import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from './constants'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'

function Probe() {
  const { theme, toggle, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setTheme('dark')}>dark</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  })
  afterEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  })

  it('initialises from localStorage and applies the attribute', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
  })

  it('trusts an attribute already set by the bootstrap script', () => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark')
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('toggle updates the attribute and localStorage together', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    act(() => screen.getByText('toggle').click())
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    act(() => screen.getByText('toggle').click())
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('setTheme sets an explicit value', () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    act(() => screen.getByText('dark').click())
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
  })
})
