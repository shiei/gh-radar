import { expect, test } from '@playwright/test'

test.use({ locale: 'ja-JP' })

test.describe('language', () => {
  test('first visit is English even on a Japanese browser', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByTestId('tagline')).toHaveText('Discover what developers are building.')
    await expect(page.getByTestId('language-switcher')).toContainText('English')
  })

  test('switching to Chinese updates copy, <html lang>, and persists', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('language-switcher').click()
    await page.getByRole('option', { name: '中文' }).click()

    await expect(page.locator('html')).toHaveAttribute('lang', 'zh')
    await expect(page.getByTestId('tagline')).toHaveText('发现开发者正在构建什么。')
    await expect(page.getByTestId('language-switcher')).toContainText('中文')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh')
    await expect(page.getByTestId('tagline')).toHaveText('发现开发者正在构建什么。')
  })

  test('options show each language in its own name', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('language-switcher').click()
    for (const name of ['English', '日本語', '中文']) {
      await expect(page.getByRole('option', { name })).toBeVisible()
    }
  })
})
