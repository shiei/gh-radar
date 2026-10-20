import { mockSearch, search } from './helpers/mockGitHub'
import { expect, test } from './helpers/test'

async function mockRateLimit(page: import('@playwright/test').Page, status: number) {
  const seen: string[] = []
  await page.route('https://api.github.com/rate_limit', async (route) => {
    seen.push((await route.request().allHeaders()).authorization ?? '')
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        resources: {
          search: { limit: 30, remaining: 29, reset: Math.floor(Date.now() / 1000) + 60 },
        },
      }),
    })
  })
  return seen
}

test.describe('github token', () => {
  test('a saved token authenticates searches; without remember it is gone after reload', async ({
    page,
  }) => {
    const rateLimitCalls = await mockRateLimit(page, 200)
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await expect(page.getByTestId('token-label')).toHaveText('Connect GitHub')

    await page.getByTestId('token-trigger').click()
    await page.getByTestId('token-input').fill('ghp_e2e_token')
    await page.getByTestId('token-save').click()
    await expect(page.getByTestId('token-label')).toContainText('29 / 30')
    expect(rateLimitCalls).toEqual(['Bearer ghp_e2e_token'])

    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    expect((await requests[0].allHeaders()).authorization).toBe('Bearer ghp_e2e_token')

    expect(await page.evaluate(() => localStorage.getItem('osr.token'))).toBeNull()
    await page.reload()
    await expect(page.getByTestId('token-trigger')).toHaveAttribute('data-token-state', 'none')
  })

  test('remember on this device persists the token across reloads', async ({ page }) => {
    await mockRateLimit(page, 200)
    await page.goto('/')
    await page.getByTestId('token-trigger').click()
    await page.getByTestId('token-input').fill('ghp_remember')
    await page.getByTestId('token-remember').check()
    await page.getByTestId('token-save').click()
    await expect(page.getByTestId('token-trigger')).toHaveAttribute('data-token-state', 'set')
    expect(await page.evaluate(() => localStorage.getItem('osr.token'))).toBe('ghp_remember')
    await page.reload()
    await expect(page.getByTestId('token-trigger')).toHaveAttribute('data-token-state', 'set')
  })

  test('the production page ships a Content Security Policy', async ({ page }) => {
    await page.goto('/')
    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content')
    expect(csp).toContain("script-src 'self' 'sha256-")
    expect(csp).toContain("connect-src 'self' https://api.github.com")
    // The hashed inline theme bootstrap still ran under the policy.
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/)
  })

  test('hovering the info icon explains the two quota pools', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('quota-help-trigger').hover()
    const help = page.getByTestId('tooltip')
    await expect(help).toBeVisible()
    await expect(help).toContainText('30')
    await expect(help).toContainText('5,000')
  })

  test('an invalid token is rejected and not stored', async ({ page }) => {
    await mockRateLimit(page, 401)
    await page.goto('/')
    await page.getByTestId('token-trigger').click()
    await page.getByTestId('token-input').fill('bad')
    await page.getByTestId('token-save').click()
    await expect(page.getByTestId('token-error')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('osr.token'))).toBeNull()
  })

  test('removing the token drops the Authorization header', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('osr.token', 'ghp_old'))
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await page.getByTestId('token-trigger').click()
    await page.getByTestId('token-remove').click()
    await expect(page.getByTestId('token-label')).toHaveText('Connect GitHub')
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    expect((await requests[0].allHeaders()).authorization).toBeUndefined()
  })

  test('repeating a search within the session does not hit the API again', async ({ page }) => {
    const requests = await mockSearch(page, 'search-react')
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await page.getByTestId('page-next').click()
    await expect(page.getByTestId('page-current')).toHaveText('2')
    await page.getByTestId('page-previous').click()
    await expect(page.getByTestId('page-current')).toHaveText('1')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    expect(requests).toHaveLength(2)
  })
})
