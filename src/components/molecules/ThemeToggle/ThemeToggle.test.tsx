import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { THEME_ATTRIBUTE, ThemeProvider } from '../../../lib/theme'
import { ThemeToggle } from './ThemeToggle'

import '../../../lib/i18n'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  afterEach(() => document.documentElement.removeAttribute(THEME_ATTRIBUTE))

  it('is a switch with an accessible name reflecting the current state', () => {
    renderToggle()
    const toggle = screen.getByRole('switch', { name: 'Dark mode' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles on click', async () => {
    renderToggle()
    const toggle = screen.getByRole('switch', { name: 'Dark mode' })
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    await userEvent.click(toggle)
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
  })

  it('toggles with Enter and Space from the keyboard', async () => {
    renderToggle()
    const toggle = screen.getByRole('switch', { name: 'Dark mode' })
    toggle.focus()
    await userEvent.keyboard('{Enter}')
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark')
    await userEvent.keyboard(' ')
    expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'light')
  })

  it('moves the thumb to the dark side when checked', async () => {
    renderToggle()
    const toggle = screen.getByRole('switch')
    const thumb = toggle.querySelector('[data-unchecked], [data-checked]')
    expect(thumb).toHaveAttribute('data-unchecked')
    await userEvent.click(toggle)
    expect(thumb).toHaveAttribute('data-checked')
  })
})
