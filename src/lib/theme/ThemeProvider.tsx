import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, type Theme } from './constants'
import { resolveInitialTheme } from './resolveInitialTheme'
import { ThemeContext } from './ThemeContext'

function readStored(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage may be unavailable (private mode, blocked). The attribute still applies.
  }
}

/** Initial value: trust what the inline bootstrap script already set on <html>, else resolve. */
function readInitialTheme(): Theme {
  const current = document.documentElement.getAttribute(THEME_ATTRIBUTE)
  return resolveInitialTheme(current ?? readStored())
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initial = readInitialTheme()
    document.documentElement.setAttribute(THEME_ATTRIBUTE, initial)
    return initial
  })

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
