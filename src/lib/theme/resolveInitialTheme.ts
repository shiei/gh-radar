import { DEFAULT_THEME, isTheme, type Theme } from './constants'

/**
 * Decide the initial theme: a stored, valid choice wins; otherwise the site default (dark).
 * The system colour-scheme preference is deliberately ignored (decided 2026-10-21).
 */
export function resolveInitialTheme(stored: unknown): Theme {
  if (isTheme(stored)) return stored
  return DEFAULT_THEME
}
