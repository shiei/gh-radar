import { GA_MEASUREMENT_ID } from './constants'
import { consentStore, type ConsentStore } from './consentStore'
import { disableAnalytics, enableAnalytics } from './gtag'

export interface InstallAnalyticsOptions {
  store?: ConsentStore
  measurementId?: string
  /** Off in dev and tests so local runs never show up in the real property. */
  enabled?: boolean
  document?: Document
  window?: Window
}

/**
 * Wire the consent store to the tag: load gtag.js when consent is (or becomes) granted,
 * switch it off when consent is withdrawn. Returns an unsubscribe function.
 */
export function installAnalytics({
  store = consentStore,
  measurementId = GA_MEASUREMENT_ID,
  enabled = import.meta.env.PROD,
  document: doc,
  window: win,
}: InstallAnalyticsOptions = {}): () => void {
  if (!enabled) return () => undefined
  let active = false
  const apply = () => {
    const granted = store.get() === 'granted'
    if (granted && !active) {
      enableAnalytics(measurementId, doc, win)
      active = true
    } else if (!granted && active) {
      disableAnalytics(measurementId, doc, win)
      active = false
    }
  }
  apply()
  return store.subscribe(apply)
}
