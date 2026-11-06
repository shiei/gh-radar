import type { Page } from '@playwright/test'

import { CONSENT_KEY, expect, test } from './helpers/test'

const TAG_URL = 'https://www.googletagmanager.com/gtag/js**'

/**
 * Undo the shared fixture's pre-answered consent so the banner shows as on a first visit.
 * Init scripts run again on every navigation, so clear only once per tab: a later reload
 * must see the decision the test made.
 */
async function firstVisit(page: Page) {
  await page.addInitScript((key) => {
    if (sessionStorage.getItem('osr.e2e.cleared')) return
    localStorage.removeItem(key)
    sessionStorage.setItem('osr.e2e.cleared', '1')
  }, CONSENT_KEY)
}

/** Record every attempt to load the GA tag (and keep blocking it). */
async function watchTag(page: Page): Promise<string[]> {
  const urls: string[] = []
  await page.route(TAG_URL, (route) => {
    urls.push(route.request().url())
    return route.abort('failed')
  })
  return urls
}

test.describe('cookie consent', () => {
  test('first visit shows the banner and loads nothing until accepted', async ({ page }) => {
    await firstVisit(page)
    const tagLoads = await watchTag(page)
    await page.goto('/')
    const banner = page.getByTestId('consent-banner')
    await expect(banner).toBeVisible()
    await expect(page.getByTestId('consent-accept')).toBeVisible()
    await expect(page.getByTestId('consent-decline')).toBeVisible()
    expect(tagLoads).toEqual([])

    await page.getByTestId('consent-accept').click()
    await expect(banner).toBeHidden()
    await expect.poll(() => tagLoads.length).toBe(1)
    expect(tagLoads[0]).toContain('id=G-')
    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe('granted')

    // The decision sticks: no banner, tag loads straight away.
    await page.reload()
    await expect(page.getByTestId('welcome')).toBeVisible()
    await expect(banner).toBeHidden()
    await expect.poll(() => tagLoads.length).toBe(2)
  })

  test('declining stores the choice and never loads the tag', async ({ page }) => {
    await firstVisit(page)
    const tagLoads = await watchTag(page)
    await page.goto('/')
    await page.getByTestId('consent-decline').click()
    await expect(page.getByTestId('consent-banner')).toBeHidden()
    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBe('denied')

    await page.reload()
    await expect(page.getByTestId('welcome')).toBeVisible()
    await expect(page.getByTestId('consent-banner')).toBeHidden()
    expect(tagLoads).toEqual([])
  })

  test('the footer link reopens the banner so the choice can be changed', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('consent-banner')).toBeHidden()
    await page.getByTestId('consent-manage').click()
    await expect(page.getByTestId('consent-banner')).toBeVisible()
    expect(await page.evaluate((k) => localStorage.getItem(k), CONSENT_KEY)).toBeNull()
  })

  test('the banner is translated', async ({ page }) => {
    await firstVisit(page)
    await page.addInitScript(() => localStorage.setItem('osr.lang', 'zh'))
    await page.goto('/')
    await expect(page.getByTestId('consent-banner')).toContainText('本站使用 Cookie')
  })
})
