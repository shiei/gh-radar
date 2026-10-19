export {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  LANGUAGES,
  type Language,
} from './constants'
export { createI18n, readStoredLanguage } from './createI18n'

import { createI18n } from './createI18n'

/** The app-wide i18next instance. Import for side effects in the app entry. */
export const i18n = createI18n()
