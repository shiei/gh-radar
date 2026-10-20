import { expect, test } from './helpers/test'

const THEME_KEY = 'osr.theme'

test.describe('theme', () => {
  test('first visit is dark regardless of a light system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('toggling to light persists across reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('light')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-checked', 'false')
  })

  test('stored theme is applied before any app script runs (no flash)', async ({ page }) => {
    await page.addInitScript((k) => localStorage.setItem(k, 'light'), THEME_KEY)
    // Block the app bundle entirely: only the inline bootstrap script can set the attribute.
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('keyboard toggles the theme', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('theme-toggle').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    await page.keyboard.press('Space')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })
})
