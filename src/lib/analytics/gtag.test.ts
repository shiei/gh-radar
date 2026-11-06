import { afterEach, describe, expect, it } from 'vitest'

import { createConsentStore } from './consentStore'
import { disableAnalytics, enableAnalytics, isAnalyticsLoaded } from './gtag'
import { installAnalytics } from './install'

const ID = 'G-TEST123'

function reset() {
  document.querySelectorAll('script[data-osr-analytics]').forEach((el) => el.remove())
  delete window.dataLayer
  delete window.gtag
  delete (window as unknown as Record<string, unknown>)[`ga-disable-${ID}`]
}

function flag(): unknown {
  return (window as unknown as Record<string, unknown>)[`ga-disable-${ID}`]
}

describe('gtag', () => {
  afterEach(reset)

  it('enableAnalytics injects the tag once and queues the config call', () => {
    enableAnalytics(ID)
    enableAnalytics(ID)
    const scripts = document.querySelectorAll('script[data-osr-analytics]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0]).toHaveAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${ID}`)
    expect(isAnalyticsLoaded()).toBe(true)
    expect(flag()).toBe(false)

    const calls = (window.dataLayer ?? []).map(
      (entry) => Array.from(entry as IArguments) as unknown[],
    )
    expect(calls[0]?.[0]).toBe('js')
    expect(calls[1]?.slice(0, 2)).toEqual(['config', ID])
    expect(calls[1]?.[2]).toMatchObject({ anonymize_ip: true, allow_google_signals: false })
    // The second call only updates consent; nothing is loaded twice.
    expect(calls[2]?.slice(0, 2)).toEqual(['consent', 'update'])
  })

  it('disableAnalytics flips the opt-out flag and expires GA cookies', () => {
    enableAnalytics(ID)
    document.cookie = '_ga=GA1.1.1; path=/'
    document.cookie = '_ga_TEST123=GS1.1.1; path=/'
    document.cookie = 'osr_other=1; path=/'
    disableAnalytics(ID)
    expect(flag()).toBe(true)
    expect(document.cookie).not.toContain('_ga')
    expect(document.cookie).toContain('osr_other=1')
  })

  it('installAnalytics follows the store and does nothing when disabled', () => {
    const store = createConsentStore(null)
    const off = installAnalytics({ store, measurementId: ID, enabled: false })
    store.set('granted')
    expect(isAnalyticsLoaded()).toBe(false)
    off()

    const unsubscribe = installAnalytics({ store, measurementId: ID, enabled: true })
    expect(isAnalyticsLoaded()).toBe(true)
    expect(flag()).toBe(false)
    store.set('denied')
    expect(flag()).toBe(true)
    store.set('granted')
    expect(flag()).toBe(false)
    expect(document.querySelectorAll('script[data-osr-analytics]')).toHaveLength(1)
    unsubscribe()
  })

  it('installAnalytics loads immediately when consent was stored earlier', () => {
    const store = createConsentStore(null)
    store.set('granted')
    const unsubscribe = installAnalytics({ store, measurementId: ID, enabled: true })
    expect(isAnalyticsLoaded()).toBe(true)
    unsubscribe()
  })
})
