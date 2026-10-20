import { expect, test } from './helpers/test'

test.describe('settings drawer', () => {
  test('below 650px the controls live in a drawer that slides in from the right', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 649, height: 800 })
    await page.goto('/')
    await expect(page.getByTestId('menu-open')).toBeVisible()
    await expect(page.getByTestId('theme-toggle')).toBeHidden()

    await page.getByTestId('menu-open').click()
    const drawer = page.getByTestId('settings-drawer')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByTestId('token-trigger')).toBeVisible()
    await expect(drawer.getByTestId('language-switcher')).toBeVisible()
    await expect(drawer.getByTestId('theme-toggle')).toBeVisible()

    await drawer.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/)
    await page.getByTestId('menu-close').click()
    await expect(drawer).toBeHidden()
  })

  test('at 650px and above the controls are inline and the hamburger is hidden', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 650, height: 800 })
    await page.goto('/')
    await expect(page.getByTestId('menu-open')).toBeHidden()
    await expect(page.getByTestId('theme-toggle')).toBeVisible()
  })
})
