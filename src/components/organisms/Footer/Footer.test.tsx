import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ALTERNATIVES } from './alternatives'
import { Footer } from './Footer'

import '../../../lib/i18n'

describe('Footer', () => {
  it('lists every alternative with a description and external links', () => {
    render(<Footer />)
    const items = screen.getAllByTestId('footer-alternative')
    expect(items).toHaveLength(ALTERNATIVES.length)
    for (const item of items) {
      const link = item.querySelector('a')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
      expect(item.textContent?.length ?? 0).toBeGreaterThan(20)
    }
    expect(screen.getByTestId('footer-project')).toHaveAttribute(
      'href',
      'https://github.com/shiei/gh-radar',
    )
  })
})
