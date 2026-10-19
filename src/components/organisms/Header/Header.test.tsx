import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ThemeProvider } from '../../../lib/theme'
import { Header } from './Header'

import '../../../lib/i18n'

describe('Header', () => {
  it('renders brand, language switcher and theme toggle', () => {
    render(
      <ThemeProvider>
        <Header />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('brand')).toHaveTextContent('OpenSource Radar')
    expect(screen.getByRole('combobox', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument()
  })
})
