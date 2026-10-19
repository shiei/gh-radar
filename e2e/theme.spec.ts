import { expect, test } from '@playwright/test'

const THEME_KEY = 'osr.theme'

test.describe('theme', () => {
  test('first visit follows a dark system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('first visit follows a light system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('toggling to dark persists across reload and overrides system preference', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-checked', 'true')
  })

  test('stored theme is applied before any app script runs (no flash)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.addInitScript((k) => localStorage.setItem(k, 'dark'), THEME_KEY)
    // Block the app bundle entirely: only the inline bootstrap script can set the attribute.
    await page.route('**/assets/*.js', (route) => route.abort())
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('keyboard toggles the theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await page.getByTestId('theme-toggle').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.keyboard.press('Space')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })
})
