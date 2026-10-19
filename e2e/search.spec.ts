import { mockSearch, mockSearchByPage, search } from './helpers/mockGitHub'
import { expect, test } from './helpers/test'

test.describe('repository search', () => {
  test('Enter submits and shows every repository fact', async ({ page }) => {
    await mockSearch(page, 'search-react')
    await page.goto('/')
    await search(page, 'react', 'enter')

    const cards = page.getByTestId('repo-card')
    await expect(cards).toHaveCount(10)
    await expect(page.getByTestId('result-count')).toContainText('7,334,251')
    await expect(page.getByTestId('result-capped')).toBeVisible()

    const first = cards.first()
    await expect(first.getByTestId('repo-link')).toHaveAttribute(
      'href',
      'https://github.com/react/react',
    )
    await expect(first.getByTestId('repo-link')).toHaveAttribute('target', '_blank')
    await expect(first.getByTestId('repo-avatar')).toHaveAttribute(
      'src',
      /avatars\.githubusercontent\.com/,
    )
    await expect(first.getByTestId('repo-avatar')).toHaveAttribute(
      'src',
      /avatars\.githubusercontent\.com/,
    )
    await expect(first.getByTestId('repo-stars')).toContainText('K')
    await expect(first.getByTestId('repo-description')).toBeVisible()
    await expect(first.getByTestId('repo-language')).toHaveText('JavaScript')
    await expect(first.getByTestId('repo-license')).toContainText('MIT')
    await expect(first.getByTestId('repo-pushed')).toContainText('ago')
    await expect(first.getByTestId('repo-topics')).toBeVisible()

    // Second fixture item has no description, license or topics: those blocks are absent.
    const second = cards.nth(1)
    await expect(second.getByTestId('repo-description')).toHaveCount(0)
    await expect(second.getByTestId('repo-license')).toHaveCount(0)
    await expect(second.getByTestId('repo-topics')).toHaveCount(0)
  })

  test('the button submits too', async ({ page }) => {
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await search(page, 'vue', 'button')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    expect(requests).toHaveLength(1)
  })

  test('typing alone sends nothing and blank input is ignored', async ({ page }) => {
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await page.getByTestId('search-input').fill('react')
    await page.waitForTimeout(300)
    expect(requests).toHaveLength(0)
    await page.getByTestId('search-input').fill('   ')
    await page.getByTestId('search-input').press('Enter')
    await page.waitForTimeout(300)
    expect(requests).toHaveLength(0)
    await expect(page.getByTestId('search-results')).toHaveCount(0)
  })

  test('qualifier syntax reaches the API untouched', async ({ page }) => {
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await search(page, 'language:rust cli stars:>500')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    const url = new URL(requests[0].url())
    expect(url.searchParams.get('q')).toBe('language:rust cli stars:>500')
    expect(url.searchParams.get('per_page')).toBe('10')
    expect(url.searchParams.has('sort')).toBe(false)
  })

  test('changing sort re-runs from page 1 with sort=stars', async ({ page }) => {
    const requests = await mockSearch(page, 'search-react')
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await page.getByTestId('page-next').click()
    await expect(page.getByTestId('page-current')).toHaveText('2')

    await page.getByTestId('search-sort').click()
    await page.getByRole('option', { name: 'Most stars' }).click()
    await expect(page.getByTestId('page-current')).toHaveText('1')
    const last = new URL(requests.at(-1)!.url())
    expect(last.searchParams.get('sort')).toBe('stars')
    expect(last.searchParams.get('order')).toBe('desc')
    expect(last.searchParams.get('page')).toBe('1')
  })

  test('changing sort before any search sends nothing, then applies', async ({ page }) => {
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await page.getByTestId('search-sort').click()
    await page.getByRole('option', { name: 'Recently updated' }).click()
    await page.waitForTimeout(300)
    expect(requests).toHaveLength(0)
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    expect(new URL(requests[0].url()).searchParams.get('sort')).toBe('updated')
  })

  test('pagination moves to page 2 and is disabled on a single page', async ({ page }) => {
    const requests = await mockSearch(page, 'search-react')
    await page.goto('/')
    await search(page, 'react')
    await expect(page.getByTestId('page-previous')).toBeDisabled()
    await page.getByTestId('page-next').click()
    await expect(page.getByTestId('page-current')).toHaveText('2')
    expect(new URL(requests.at(-1)!.url()).searchParams.get('page')).toBe('2')
    await expect(page.getByTestId('page-previous')).toBeEnabled()

    await mockSearch(page, 'search-small')
    await search(page, 'tiny')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    await expect(page.getByTestId('page-previous')).toBeDisabled()
    await expect(page.getByTestId('page-next')).toBeDisabled()
  })

  test('timestamps explain themselves in a styled tooltip on hover', async ({ page }) => {
    await mockSearch(page, 'search-small')
    await page.goto('/')
    await search(page, 'react')
    await page.getByTestId('repo-card').first().getByTestId('repo-pushed').hover()
    const tip = page.getByTestId('tooltip')
    await expect(tip).toBeVisible()
    await expect(tip).toContainText('Last code push')
    await expect(tip).toContainText(/\d{4}/)
    await expect(tip).toHaveCSS('border-top-left-radius', /[1-9]/)
  })

  test('clicking a topic tag searches topic:<name> from page 1', async ({ page }) => {
    const requests = await mockSearch(page, 'search-react')
    await page.goto('/')
    await search(page, 'react')
    await page.getByTestId('page-next').click()
    await expect(page.getByTestId('page-current')).toHaveText('2')
    const firstTopic = page.getByTestId('repo-card').first().getByTestId('repo-topic').first()
    const name = (await firstTopic.textContent())!.trim()
    await firstTopic.click()
    await expect(page.getByTestId('search-input')).toHaveValue(`topic:${name}`)
    await expect(page.getByTestId('page-current')).toHaveText('1')
    const last = new URL(requests.at(-1)!.url())
    expect(last.searchParams.get('q')).toBe(`topic:${name}`)
    expect(last.searchParams.get('page')).toBe('1')
  })

  test('numbered links jump to the last reachable page 100', async ({ page }) => {
    const requests = await mockSearchByPage(page, { 100: 'search-page100' }, 'search-react')
    await page.goto('/')
    await search(page, 'react')
    await page.getByRole('button', { name: 'Page 100 of 100' }).click()
    await expect(page.getByTestId('page-current')).toHaveText('100')
    expect(new URL(requests.at(-1)!.url()).searchParams.get('page')).toBe('100')
    await expect(page.getByTestId('page-next')).toBeDisabled()
    await expect(page.getByTestId('page-previous')).toBeEnabled()
    await expect(page.getByTestId('repo-card').first()).toContainText('p100')
  })
})
