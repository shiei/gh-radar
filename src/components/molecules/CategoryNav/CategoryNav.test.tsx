import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CATEGORIES } from '../../../lib/categories'
import { CategoryNav } from './CategoryNav'

import '../../../lib/i18n'

describe('CategoryNav', () => {
  it('renders the six categories in order with translated names', () => {
    render(<CategoryNav variant="list" activeQuery="" onSelect={vi.fn()} />)
    const items = screen.getAllByTestId('category-item')
    expect(items.map((el) => el.dataset.category)).toEqual(CATEGORIES.map((c) => c.id))
    expect(items[2]).toHaveTextContent('AI / ML')
  })

  it('marks the category whose query matches exactly and calls onSelect', async () => {
    const onSelect = vi.fn()
    const devops = CATEGORIES.find((c) => c.id === 'devops')!
    render(<CategoryNav variant="chips" activeQuery={devops.query} onSelect={onSelect} />)
    const active = screen
      .getAllByTestId('category-item')
      .filter((el) => el.getAttribute('aria-current') === 'true')
    expect(active).toHaveLength(1)
    expect(active[0]).toHaveAttribute('data-category', 'devops')
    await userEvent.click(screen.getByRole('button', { name: 'Frontend' }))
    expect(onSelect).toHaveBeenCalledWith(CATEGORIES[0])
  })

  it('has no active item for a free-text query', () => {
    render(<CategoryNav variant="list" activeQuery="react" onSelect={vi.fn()} />)
    expect(screen.queryAllByRole('button', { current: 'true' })).toHaveLength(0)
  })
})
