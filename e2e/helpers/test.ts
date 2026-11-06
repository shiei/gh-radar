import { test as base } from '@playwright/test'

export const CONSENT_KEY = 'osr.consent'

/** Hosts the Google Analytics tag talks to. Blocked in every spec. */
export const ANALYTICS_HOSTS = [
  'https://*.googletagmanager.com/**',
  'https://*.google-analytics.com/**',
  'https://*.analytics.google.com/**',
]

/**
 * Shared test: every page starts with a fallback route that aborts any request to
 * api.github.com and to Google Analytics, so no spec can reach a real service by accident.
 * Spec-level routes registered later take precedence over these.
 *
 * Cookie consent is pre-answered as "denied" (unless something is stored already) so the
 * banner does not sit over the page in unrelated specs; consent.spec.ts clears it again to
 * exercise the banner itself.
 */
export const test = base.extend<{ networkFallback: void }>({
  networkFallback: [
    async ({ page }, use) => {
      await page.route('https://api.github.com/**', (route) => route.abort('failed'))
      for (const host of ANALYTICS_HOSTS) {
        await page.route(host, (route) => route.abort('failed'))
      }
      await page.addInitScript((key) => {
        if (localStorage.getItem(key) === null) localStorage.setItem(key, 'denied')
      }, CONSENT_KEY)
      await use()
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
