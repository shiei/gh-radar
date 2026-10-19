import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslation } from 'react-i18next'
import { beforeEach, describe, expect, it } from 'vitest'

import { i18n, LANGUAGE_STORAGE_KEY } from '../../../lib/i18n'
import { LanguageSwitcher } from './LanguageSwitcher'

function Probe() {
  const { t } = useTranslation()
  return <p data-testid="label">{t('language.label')}</p>
}

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('has an accessible name and shows the current language', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('combobox', { name: 'Language' })
    expect(trigger).toHaveTextContent('English')
  })

  it('switches copy, <html lang> and storage when a language is chosen', async () => {
    const user = userEvent.setup()
    render(
      <>
        <LanguageSwitcher />
        <Probe />
      </>,
    )
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: '中文' }))
    expect(screen.getByTestId('label')).toHaveTextContent('语言')
    expect(document.documentElement.lang).toBe('zh')
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('zh')
  })

  it('keeps an indicator placeholder in every option so labels stay in the second column', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('combobox'))
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(3)
    for (const option of options) {
      const placeholder = option.querySelector(':scope > span[aria-hidden="true"]')
      expect(placeholder).not.toBeNull()
      expect(option.firstElementChild).toBe(placeholder)
    }
  })

  it('lists every language by its own name', async () => {
    const user = userEvent.setup()
    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('combobox'))
    for (const name of ['English', '日本語', '中文']) {
      expect(await screen.findByRole('option', { name })).toBeInTheDocument()
    }
  })
})
