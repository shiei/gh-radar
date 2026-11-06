/**
 * Loading and switching off the Google Analytics tag. Nothing here runs until the visitor
 * has accepted cookies (see install.ts), so a visitor who declines never contacts Google.
 */

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

const SCRIPT_ATTRIBUTE = 'data-osr-analytics'

function tagScriptUrl(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
}

function disableFlag(id: string): string {
  // Documented GA opt-out switch: when this global is true the tag sends nothing.
  return `ga-disable-${id}`
}

function setFlag(win: Window, id: string, value: boolean) {
  ;(win as unknown as Record<string, unknown>)[disableFlag(id)] = value
}

export function isAnalyticsLoaded(doc: Document = document): boolean {
  return doc.querySelector(`script[${SCRIPT_ATTRIBUTE}]`) !== null
}

/** Inject gtag.js and configure the property. Safe to call more than once. */
export function enableAnalytics(id: string, doc: Document = document, win: Window = window): void {
  setFlag(win, id, false)
  if (isAnalyticsLoaded(doc)) {
    win.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    return
  }
  const dataLayer = (win.dataLayer ??= [])
  // gtag.js expects the `arguments` object itself on the data layer, not an array copy.
  win.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments)
  }
  win.gtag('js', new Date())
  win.gtag('config', id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
  const script = doc.createElement('script')
  script.async = true
  script.src = tagScriptUrl(id)
  script.setAttribute(SCRIPT_ATTRIBUTE, 'true')
  doc.head.appendChild(script)
}

/**
 * Stop sending data and drop the GA cookies we can reach. The script itself cannot be
 * unloaded; the opt-out flag makes it inert until the next page load.
 */
export function disableAnalytics(id: string, doc: Document = document, win: Window = window): void {
  setFlag(win, id, true)
  win.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  const names = doc.cookie
    .split(';')
    .map((part) => part.trim().split('=')[0] ?? '')
    .filter((name) => name === '_ga' || name.startsWith('_ga_'))
  for (const name of names) {
    doc.cookie = `${name}=; ${expired}`
    if (win.location.hostname) doc.cookie = `${name}=; ${expired}; domain=${win.location.hostname}`
  }
}
