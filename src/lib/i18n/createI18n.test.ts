import { beforeEach, describe, expect, it } from 'vitest'

import { LANGUAGE_STORAGE_KEY } from './constants'
import { createI18n } from './createI18n'

describe('createI18n', () => {
  beforeEach(() => {
    document.documentElement.lang = ''
    Object.defineProperty(window.navigator, 'language', { value: 'ja-JP', configurable: true })
  })

  it('defaults to English and ignores the browser language', () => {
    const i18n = createI18n()
    expect(i18n.language).toBe('en')
    expect(i18n.t('language.label')).toBe('Language')
    expect(document.documentElement.lang).toBe('en')
  })

  it('restores a stored language', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'zh')
    const i18n = createI18n()
    expect(i18n.language).toBe('zh')
    expect(i18n.t('language.label')).toBe('语言')
    expect(document.documentElement.lang).toBe('zh')
  })

  it('ignores an invalid stored value', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(createI18n().language).toBe('en')
  })

  it('persists and updates <html lang> on change', async () => {
    const i18n = createI18n()
    await i18n.changeLanguage('ja')
    expect(document.documentElement.lang).toBe('ja')
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('ja')
    expect(i18n.t('language.label')).toBe('言語')
  })
})
