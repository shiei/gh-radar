import { mockSearch, search } from './helpers/mockGitHub'
import { expect, test } from './helpers/test'

test.describe('search state in the URL', () => {
  test('a shared link runs its search and the URL follows every change', async ({ page }) => {
    const requests = await mockSearch(page, 'search-react')
    await page.goto('/?q=react&sort=stars&page=2')
    await expect(page.getByTestId('repo-card')).toHaveCount(10)
    await expect(page.getByTestId('search-input')).toHaveValue('react')
    const sent = new URL(requests[0].url()).searchParams
    expect(sent.get('q')).toBe('react')
    expect(sent.get('sort')).toBe('stars')
    expect(sent.get('page')).toBe('2')

    await search(page, 'vue')
    // Sort is a setting and survives a new query; only the page resets.
    await expect(page).toHaveURL(/\?q=vue&sort=stars$/)

    await page.goBack()
    await expect(page).toHaveURL(/\?q=react&sort=stars&page=2$/)
    await expect(page.getByTestId('search-input')).toHaveValue('react')

    await page.goBack()
    await expect(page).not.toHaveURL(/q=/)
    await expect(page.getByTestId('repo-card')).toHaveCount(0)
  })
})
