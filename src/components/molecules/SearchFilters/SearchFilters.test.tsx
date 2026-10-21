import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_FILTERS } from '../../../lib/github'
import { activeFilterCount } from './activeFilterCount'
import { SearchFilters } from './SearchFilters'

import '../../../lib/i18n'

describe('activeFilterCount', () => {
  it('counts filters that differ from the defaults', () => {
    expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0)
    expect(
      activeFilterCount({
        language: 'Go',
        minStars: 100,
        excludeForks: true,
        excludeArchived: true,
      }),
    ).toBe(4)
  })
})

describe('SearchFilters panel', () => {
  it('reports switch changes as partial patches and clears everything', async () => {
    const onChange = vi.fn()
    render(
      <SearchFilters
        variant="panel"
        filters={{ ...DEFAULT_FILTERS, language: 'Rust' }}
        onChange={onChange}
      />,
    )
    expect(screen.getByTestId('search-filters-active')).toHaveTextContent('(1)')
    expect(screen.getByTestId('filter-language')).toHaveTextContent('Rust')
    await userEvent.click(screen.getByTestId('filter-exclude-forks'))
    expect(onChange).toHaveBeenLastCalledWith({ excludeForks: true })
    await userEvent.click(screen.getByTestId('filter-exclude-archived'))
    expect(onChange).toHaveBeenLastCalledWith({ excludeArchived: true })
    await userEvent.click(screen.getByTestId('filter-clear'))
    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_FILTERS)
  })

  it('offers a language that is not in the fixed list when it is selected', () => {
    render(
      <SearchFilters
        variant="panel"
        filters={{ ...DEFAULT_FILTERS, language: 'Vue' }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('filter-language')).toHaveTextContent('Vue')
  })

  it('hides the clear button while nothing is active', () => {
    render(<SearchFilters variant="panel" filters={DEFAULT_FILTERS} onChange={vi.fn()} />)
    expect(screen.queryByTestId('filter-clear')).toBeNull()
    expect(screen.queryByTestId('search-filters-active')).toBeNull()
  })
})

describe('SearchFilters collapsible', () => {
  it('starts folded, shows the active count, and unfolds on click', async () => {
    render(
      <SearchFilters
        variant="collapsible"
        filters={{ ...DEFAULT_FILTERS, minStars: 1000, excludeForks: true }}
        onChange={vi.fn()}
      />,
    )
    const toggle = screen.getByTestId('search-filters-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('search-filters-active')).toHaveTextContent('2 active')
    expect(screen.queryByTestId('search-filters')).toBeNull()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('filter-min-stars')).toHaveTextContent('1,000+')
  })
})
