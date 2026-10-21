import { mockSearchTypes, requestedQueries, search } from './helpers/mockGitHub'
import { expect, test } from './helpers/test'

const ALL = {
  repositories: 'search-react',
  users: 'search-users',
  topics: 'search-topics',
} as const

async function mockRateLimit(page: import('@playwright/test').Page) {
  await page.route('https://api.github.com/rate_limit', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({
        resources: {
          search: { limit: 30, remaining: 29, reset: Math.floor(Date.now() / 1000) + 60 },
        },
      }),
    }),
  )
}

async function setToken(page: import('@playwright/test').Page) {
  await page.getByTestId('token-trigger').click()
  await page.getByTestId('token-input').fill('ghp_e2e_token')
  await page.getByTestId('token-save').click()
  await expect(page.getByTestId('token-trigger')).toHaveAttribute('data-token-state', 'set')
}

test.describe('search types', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
  })

  test('switching to Users re-searches page 1 against /search/users and shows user cards', async ({
    page,
  }) => {
    const requests = await mockSearchTypes(page, ALL)
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await expect(page.getByTestId('search-sort')).toBeVisible()

    await page.getByTestId('search-type').filter({ hasText: 'Users' }).click()
    await expect(page.getByTestId('user-card')).toHaveCount(3)
    await expect(page.getByTestId('result-count')).toContainText('1,234 users matched')
    await expect(page.getByTestId('search-sort')).toHaveCount(0)
    await expect(page.getByTestId('search-filters-panel')).toHaveCount(0)
    await expect(page.getByTestId('search-input')).toHaveAttribute(
      'placeholder',
      'Search users and organizations...',
    )
    const first = page.getByTestId('user-card').first()
    await expect(first.getByTestId('user-link')).toHaveAttribute(
      'href',
      'https://github.com/facebook',
    )
    await expect(first.getByTestId('user-kind')).toHaveText('Organization')

    expect(requestedQueries(requests)).toEqual([
      '/search/repositories q=react per_page=10',
      '/search/users q=react per_page=10',
    ])
  })

  test('a topic card leads back to a repository search for that topic', async ({ page }) => {
    const requests = await mockSearchTypes(page, ALL)
    await page.goto('/')
    await page.getByTestId('search-type').filter({ hasText: 'Topics' }).click()
    // No query yet: only the type is remembered.
    await page.waitForTimeout(200)
    expect(requests).toHaveLength(0)

    await search(page, 'react')
    await expect(page.getByTestId('topic-card')).toHaveCount(3)
    await expect(page.getByTestId('topic-card').first().getByTestId('topic-featured')).toBeVisible()

    await page.getByTestId('topic-name').first().click()
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await expect(page.getByTestId('search-input')).toHaveValue('topic:react')
    await expect(
      page.getByTestId('search-type').filter({ hasText: 'Repositories' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(requestedQueries(requests)).toEqual([
      '/search/topics q=react per_page=10',
      '/search/repositories q=topic:react per_page=10',
    ])
  })

  test('without a token only the main request is sent and tabs show no counts', async ({
    page,
  }) => {
    const requests = await mockSearchTypes(page, ALL)
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await page.waitForTimeout(300)
    expect(requests).toHaveLength(1)
    await expect(page.getByTestId('search-type-count')).toHaveCount(0)
  })

  test('with a token the other two types get per_page=1 count requests', async ({ page }) => {
    await mockRateLimit(page)
    const requests = await mockSearchTypes(page, ALL)
    await page.goto('/')
    await setToken(page)
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    const counts = page.getByTestId('search-type-count')
    await expect(counts).toHaveCount(2)
    await expect(counts.nth(0)).toHaveText('1.2K')
    await expect(counts.nth(1)).toHaveText('56')
    expect(requestedQueries(requests).sort()).toEqual([
      '/search/repositories q=react per_page=10',
      '/search/topics q=react per_page=1',
      '/search/users q=react per_page=1',
    ])
  })
})

test.describe('search filters', () => {
  test('filters compose qualifiers without touching the input, from page 1', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const requests = await mockSearchTypes(page, ALL)
    await page.goto('/')
    await search(page, 'cli')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await page.getByTestId('page-link').filter({ hasText: '3' }).click()
    await expect(page.getByTestId('page-current')).toHaveText('3')

    const panel = page.getByTestId('search-filters-panel')
    await panel.getByTestId('filter-language').click()
    await page.getByRole('option', { name: 'Rust' }).click()
    await panel.getByTestId('filter-min-stars').click()
    await page.getByRole('option', { name: '1,000+' }).click()
    await panel.getByTestId('filter-exclude-forks').click()

    await expect(panel.getByTestId('search-filters-active')).toHaveText('(3)')
    await expect(page.getByTestId('search-input')).toHaveValue('cli')
    await expect(page.getByTestId('page-current')).toHaveText('1')
    const last = new URL(requests[requests.length - 1].url())
    expect(last.searchParams.get('q')).toBe('cli language:Rust stars:>=1000 fork:false')
    expect(last.searchParams.get('page')).toBe('1')

    // Clearing goes back to the plain "cli" page 1, which the session cache still holds.
    const sent = requests.length
    await panel.getByTestId('filter-clear').click()
    await expect(panel.getByTestId('search-filters-active')).toHaveCount(0)
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await page.waitForTimeout(200)
    expect(requests).toHaveLength(sent)
  })

  test('clicking a language on a card sets the language filter', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const requests = await mockSearchTypes(page, ALL)
    await page.goto('/')
    await search(page, 'react')
    await page.getByTestId('repo-language').first().click()
    await expect(
      page.getByTestId('search-filters-panel').getByTestId('filter-language'),
    ).toHaveText(/JavaScript/)
    await expect(page.getByTestId('search-input')).toHaveValue('react')
    const last = new URL(requests[requests.length - 1].url())
    expect(last.searchParams.get('q')).toBe('react language:JavaScript')
  })

  test('on a narrow screen the filters fold under the search box with an active count', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await mockSearchTypes(page, ALL)
    await page.goto('/')
    // The sidebar panel is only hidden by CSS below lg; the collapsible is what the user sees.
    await expect(page.getByTestId('search-filters-panel')).toBeHidden()
    const box = page.getByTestId('search-filters-collapsible')
    const toggle = box.getByTestId('search-filters-toggle')
    await expect(toggle).toBeVisible()
    await expect(box.getByTestId('search-filters')).toHaveCount(0)
    await toggle.click()
    await box.getByTestId('filter-language').click()
    await page.getByRole('option', { name: 'Rust' }).click()
    await expect(box.getByTestId('search-filters-active')).toHaveText('(1 active)')
    await toggle.click()
    await expect(box.getByTestId('search-filters')).toHaveCount(0)
    await expect(box.getByTestId('search-filters-active')).toHaveText('(1 active)')
  })
})
