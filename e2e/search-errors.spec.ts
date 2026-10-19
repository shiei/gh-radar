import { loadFixture, mockSearch, search } from './helpers/mockGitHub'
import { expect, test } from './helpers/test'

test.describe('repository search: edge and error states', () => {
  test('empty result keeps the query in the input', async ({ page }) => {
    await mockSearch(page, 'search-empty')
    await page.goto('/')
    await search(page, 'zzzz-nothing')
    await expect(page.getByTestId('search-empty')).toBeVisible()
    await expect(page.getByTestId('search-input')).toHaveValue('zzzz-nothing')
  })

  test('403 with remaining 0 shows the reset time', async ({ page }) => {
    const resetAt = new Date('2026-10-19T14:32:00Z')
    await mockSearch(page, null, {
      status: 403,
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(Math.floor(resetAt.getTime() / 1000)),
      },
      body: JSON.stringify({ message: 'API rate limit exceeded' }),
    })
    await page.goto('/')
    await search(page, 'react')
    const text = page.getByTestId('search-error-text')
    await expect(text).toHaveAttribute('data-error-kind', 'rate_limited')
    await expect(text).toContainText('request limit')
    await expect(text).toContainText('32')
  })

  test('422 shows the invalid query message without rate limit info', async ({ page }) => {
    await mockSearch(page, null, {
      status: 422,
      body: JSON.stringify({ message: 'Validation Failed' }),
    })
    await page.goto('/')
    await search(page, 'stars:>>>')
    const text = page.getByTestId('search-error-text')
    await expect(text).toHaveAttribute('data-error-kind', 'invalid_query')
    await expect(text).not.toContainText('request limit')
  })

  test('an unmocked request is aborted by the fallback and shows network failure with retry', async ({
    page,
  }) => {
    // No mockSearch here on purpose: only the global fallback route is active.
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('search-error-text')).toHaveAttribute(
      'data-error-kind',
      'network',
    )

    const requests = await mockSearch(page, 'search-small')
    await page.getByTestId('search-retry').click()
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    expect(new URL(requests[0].url()).searchParams.get('q')).toBe('react')
  })

  test('requests are unauthenticated and carry the GitHub headers', async ({ page }) => {
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    const headers = await requests[0].allHeaders()
    expect(headers.authorization).toBeUndefined()
    expect(headers.accept).toBe('application/vnd.github+json')
    expect(headers['x-github-api-version']).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('loading shows a spinner in the field and a newer search wins', async ({ page }) => {
    const requests: string[] = []
    await page.route('https://api.github.com/search/repositories**', async (route) => {
      const q = new URL(route.request().url()).searchParams.get('q') ?? ''
      requests.push(q)
      // "slow" answers late with 10 items; "fast" answers at once with 7.
      if (q === 'slow') await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: loadFixture(q === 'slow' ? 'search-react' : 'search-small'),
      })
    })
    await page.goto('/')
    await search(page, 'slow')
    await expect(page.getByTestId('search-loading')).toBeVisible()
    await expect(page.getByTestId('search-submit')).toHaveAttribute('aria-busy', 'true')

    await search(page, 'fast')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    expect(requests).toEqual(['slow', 'fast'])

    // Wait past the slow response; it must not overwrite the newer result.
    await page.waitForTimeout(2000)
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
  })
})
