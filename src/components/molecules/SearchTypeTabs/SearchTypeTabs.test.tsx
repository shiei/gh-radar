import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchTypeTabs } from './SearchTypeTabs'

import '../../../lib/i18n'

describe('SearchTypeTabs', () => {
  it('marks the active type and reports clicks', async () => {
    const onChange = vi.fn()
    render(<SearchTypeTabs value="repositories" counts={{}} onChange={onChange} />)
    const tabs = screen.getAllByTestId('search-type')
    expect(tabs.map((el) => el.dataset.type)).toEqual(['repositories', 'users', 'topics'])
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true')
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryAllByTestId('search-type-count')).toHaveLength(0)
    await userEvent.click(tabs[2]!)
    expect(onChange).toHaveBeenCalledWith('topics')
  })

  it('shows compact counts for the other types only', () => {
    render(
      <SearchTypeTabs
        value="users"
        counts={{ repositories: 7334251, users: 5, topics: 42 }}
        onChange={vi.fn()}
      />,
    )
    const counts = screen.getAllByTestId('search-type-count')
    expect(counts.map((el) => el.textContent)).toEqual(['7.3M', '42'])
  })
})
