import i18next, { type i18n } from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../../locales/en.json'
import ja from '../../locales/ja.json'
import zh from '../../locales/zh.json'
import { DEFAULT_LANGUAGE, isLanguage, LANGUAGE_STORAGE_KEY, type Language } from './constants'

export const resources = {
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
} as const

export function readStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(stored) ? stored : null
  } catch {
    return null
  }
}

function persistLanguage(language: string) {
  document.documentElement.lang = language
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Storage may be unavailable; the UI still switches.
  }
}

/**
 * Build an i18next instance. Initial language is the stored choice or English.
 * Browser language preferences are deliberately ignored (see design D5).
 */
export function createI18n(): i18n {
  const instance = i18next.createInstance()
  const initial = readStoredLanguage() ?? DEFAULT_LANGUAGE

  void instance.use(initReactI18next).init({
    resources,
    lng: initial,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ['en', 'ja', 'zh'],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })

  document.documentElement.lang = initial
  instance.on('languageChanged', persistLanguage)
  return instance
}
