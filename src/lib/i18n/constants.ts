export const LANGUAGE_STORAGE_KEY = 'osr.lang'
export const LANGUAGES = ['en', 'ja', 'zh'] as const
export type Language = (typeof LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'en'

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}
