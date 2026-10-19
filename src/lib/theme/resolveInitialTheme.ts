import { DEFAULT_THEME, isTheme, type Theme } from './constants'

/**
 * Decide the initial theme.
 * 1. A stored, valid choice wins.
 * 2. Otherwise follow the system preference when it is known.
 * 3. Otherwise fall back to the default (light).
 */
export function resolveInitialTheme(stored: unknown, prefersDark: boolean | null): Theme {
  if (isTheme(stored)) return stored
  if (prefersDark === true) return 'dark'
  if (prefersDark === false) return 'light'
  return DEFAULT_THEME
}
