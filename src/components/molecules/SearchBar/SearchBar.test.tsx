import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchBar } from './SearchBar'

import '../../../lib/i18n'

function setup(loading = false) {
  const onSubmit = vi.fn()
  const onSortChange = vi.fn()
  render(
    <SearchBar
      query=""
      sort="best"
      loading={loading}
      onSubmit={onSubmit}
      onSortChange={onSortChange}
    />,
  )
  return { onSubmit, onSortChange, user: userEvent.setup() }
}

describe('SearchBar', () => {
  it('is a search field with a soft keyboard search hint', () => {
    setup()
    const input = screen.getByTestId('search-input')
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveAttribute('enterkeyhint', 'search')
  })

  it('submits with Enter', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByTestId('search-input'), 'react{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('react')
  })

  it('submits with the inline arrow and trims the query', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByTestId('search-input'), '  vue ')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSubmit).toHaveBeenCalledWith('vue')
  })

  it('does not submit while typing', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByTestId('search-input'), 'react')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('ignores blank input', async () => {
    const { onSubmit, user } = setup()
    await user.type(screen.getByTestId('search-input'), '   {Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByTestId('search-input')).toBeEnabled()
  })

  it('shows a spinner while loading and still accepts a new submit', async () => {
    const { onSubmit, user } = setup(true)
    const submit = screen.getByTestId('search-submit')
    expect(submit).toHaveAttribute('aria-busy', 'true')
    expect(submit).toBeEnabled()
    await user.type(screen.getByTestId('search-input'), 'svelte{Enter}')
    expect(onSubmit).toHaveBeenCalledWith('svelte')
  })

  it('mirrors an externally submitted query into the input', () => {
    const { rerender } = render(
      <SearchBar query="" sort="best" loading={false} onSubmit={vi.fn()} onSortChange={vi.fn()} />,
    )
    rerender(
      <SearchBar
        query="topic:react"
        sort="best"
        loading={false}
        onSubmit={vi.fn()}
        onSortChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('search-input')).toHaveValue('topic:react')
  })

  it('reports sort changes', async () => {
    const { onSortChange, user } = setup()
    await user.click(screen.getByTestId('search-sort'))
    await user.click(await screen.findByRole('option', { name: 'Most stars' }))
    expect(onSortChange).toHaveBeenCalledWith('stars')
  })
})
