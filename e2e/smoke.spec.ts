import { expect, test } from '@playwright/test'

test('home page loads with header controls and no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await expect(page).toHaveTitle('OpenSource Radar')
  await expect(page.getByTestId('brand')).toHaveText('OpenSource Radar')
  await expect(page.getByTestId('language-switcher')).toBeVisible()
  await expect(page.getByTestId('theme-toggle')).toBeVisible()
  await expect(page.getByTestId('welcome')).toBeVisible()
  expect(errors).toEqual([])
})
