import { mockSearch, search } from './helpers/mockGitHub'
import { freezeDate, mockSnapshot } from './helpers/mockSnapshot'
import { expect, test } from './helpers/test'

test.describe('discovery home', () => {
  test('wide screens show sidebar, results column and rankings with deltas', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await freezeDate(page)
    await mockSnapshot(page)
    await page.goto('/')
    await expect(page.getByTestId('discovery-sidebar')).toBeVisible()
    await expect(page.getByTestId('discovery-chips')).toBeHidden()
    await expect(page.getByTestId('discovery-aside')).toBeVisible()
    await expect(page.getByTestId('ranking-popular').getByTestId('ranking-item')).toHaveCount(5)
    const rising = page.getByTestId('ranking-rising')
    await expect(rising).toHaveAttribute('data-mode', 'normal')
    await expect(rising.getByTestId('ranking-item')).toHaveCount(5)
    await expect(rising.getByTestId('ranking-delta').first()).toContainText('+')
    await expect(page.getByTestId('rankings-date')).toContainText('2026-10-20')
  })

  test('clicking a category runs its query and filters the rankings', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await freezeDate(page)
    await mockSnapshot(page)
    const requests = await mockSearch(page, 'search-small')
    await page.goto('/')
    await page
      .getByTestId('discovery-sidebar')
      .getByTestId('category-item')
      .filter({ hasText: 'DevOps' })
      .click()
    await expect(page.getByTestId('search-input')).toHaveValue('topic:devops stars:>200')
    expect(new URL(requests[0].url()).searchParams.get('q')).toBe('topic:devops stars:>200')
    await expect(
      page.getByTestId('discovery-sidebar').locator('[aria-current="true"]'),
    ).toHaveAttribute('data-category', 'devops')
    const names = await page
      .getByTestId('ranking-popular')
      .getByTestId('ranking-item')
      .allTextContents()
    expect(names.every((n) => n.includes('devops-org'))).toBe(true)
    // Rankings stay visible beside the results on wide screens.
    await expect(page.getByTestId('repo-card').first()).toBeVisible()
    await expect(page.getByTestId('discovery-aside')).toBeVisible()
  })

  test('view all expands a ranking to every item', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await freezeDate(page)
    await mockSnapshot(page)
    await page.goto('/')
    await page.getByTestId('ranking-popular-toggle').click()
    await expect(page.getByTestId('ranking-popular').getByTestId('ranking-item')).toHaveCount(30)
    await expect(page.getByTestId('ranking-popular-toggle')).toHaveText('Show less')
  })

  test('narrow screens use chips and hide rankings once there are results', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await freezeDate(page)
    await mockSnapshot(page)
    await mockSearch(page, 'search-small')
    await page.goto('/')
    await expect(page.getByTestId('discovery-sidebar')).toBeHidden()
    await expect(page.getByTestId('category-nav-chips')).toBeVisible()
    await expect(page.getByTestId('discovery-aside')).toBeVisible()
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
    await expect(page.getByTestId('discovery-aside')).toBeHidden()
  })

  test('missing snapshot data shows a notice and search still works', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await mockSnapshot(page, { missing: true })
    await mockSearch(page, 'search-small')
    await page.goto('/')
    await expect(page.getByTestId('rankings-missing')).toBeVisible()
    await search(page, 'react')
    await expect(page.getByTestId('repo-card')).toHaveCount(7)
  })
})
