/**
 * Shared between the React side and the inline bootstrap script in index.html.
 * If you change a value here, update index.html to match.
 */
export const THEME_STORAGE_KEY = 'osr.theme'
export const THEME_ATTRIBUTE = 'data-theme'
export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]
export const DEFAULT_THEME: Theme = 'dark'

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value)
}
