import { test as base } from '@playwright/test'

/**
 * Shared test: every page starts with a fallback route that aborts any request to
 * api.github.com, so no spec can hit the real API by accident. Spec-level routes
 * registered later take precedence over this one.
 */
export const test = base.extend<{ githubFallback: void }>({
  githubFallback: [
    async ({ page }, use) => {
      await page.route('https://api.github.com/**', (route) => route.abort('failed'))
      await use()
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
