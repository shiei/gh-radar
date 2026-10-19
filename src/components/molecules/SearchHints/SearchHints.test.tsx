import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SEARCH_EXAMPLES } from './examples'
import { SearchHints } from './SearchHints'

import '../../../lib/i18n'

describe('SearchHints', () => {
  it('lists every example and picks one on click', async () => {
    const onPick = vi.fn()
    render(<SearchHints onPick={onPick} />)
    expect(screen.getAllByTestId('search-hint')).toHaveLength(SEARCH_EXAMPLES.length)
    await userEvent.click(screen.getByRole('button', { name: 'language:rust' }))
    expect(onPick).toHaveBeenCalledWith('language:rust')
  })

  it('links to the GitHub syntax docs in a new tab', () => {
    render(<SearchHints onPick={vi.fn()} />)
    const link = screen.getByTestId('search-syntax-link')
    expect(link).toHaveAttribute('href', expect.stringContaining('docs.github.com'))
    expect(link).toHaveAttribute('target', '_blank')
  })
})
