import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { initialSearchState, type SearchState } from '../../../features/search'
import type { Repository } from '../../../lib/github'
import { SearchResults } from './SearchResults'

import '../../../lib/i18n'

const repo = (id: number): Repository => ({
  id,
  owner: 'o',
  avatarUrl: null,
  name: `r${id}`,
  fullName: `o/r${id}`,
  htmlUrl: `https://github.com/o/r${id}`,
  description: null,
  stars: id,
  language: null,
  updatedAt: '2026-01-01T00:00:00Z',
  topics: [],
  license: null,
  pushedAt: '2026-01-01T00:00:00Z',
  createdAt: '2025-01-01T00:00:00Z',
  archived: false,
  isFork: false,
  isTemplate: false,
  openIssues: 0,
  forks: 0,
  ownerType: 'User',
  homepage: null,
  sizeKb: 10,
})

function success(totalCount: number, count: number): SearchState {
  return {
    ...initialSearchState,
    query: 'x',
    status: 'success',
    requestId: 1,
    result: {
      totalCount,
      incompleteResults: false,
      items: Array.from({ length: count }, (_, i) => repo(i + 1)),
    },
  }
}

describe('SearchResults', () => {
  it('renders nothing while idle', () => {
    const { container } = render(
      <SearchResults
        state={initialSearchState}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onSearch={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a plain count for small result sets', () => {
    render(
      <SearchResults
        state={success(42, 10)}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-count')).toHaveTextContent('42 repositories matched')
    expect(screen.queryByTestId('result-capped')).toBeNull()
    expect(screen.getAllByTestId('repo-card')).toHaveLength(10)
    expect(screen.getByTestId('page-current')).toHaveTextContent('1')
    expect(screen.getAllByTestId('page-link')).toHaveLength(4)
  })

  it('explains the 1000 cap for large result sets', () => {
    render(
      <SearchResults
        state={success(120000, 10)}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-count')).toHaveTextContent('120,000 repositories matched')
    expect(screen.getByTestId('result-capped')).toHaveTextContent('first 1,000')
    expect(screen.getByRole('button', { name: 'Page 100 of 100' })).toBeInTheDocument()
  })

  it('shows status messages for loading, empty and error', () => {
    const { rerender } = render(
      <SearchResults
        state={{ ...initialSearchState, query: 'x', status: 'loading', requestId: 1 }}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByTestId('search-loading')).toBeInTheDocument()
    rerender(
      <SearchResults
        state={{ ...initialSearchState, query: 'x', status: 'empty', requestId: 1 }}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByTestId('search-empty')).toBeInTheDocument()
    rerender(
      <SearchResults
        state={{
          ...initialSearchState,
          query: 'x',
          status: 'error',
          requestId: 1,
          error: { kind: 'network' },
        }}
        onPageChange={vi.fn()}
        onRetry={vi.fn()}
        onSearch={vi.fn()}
      />,
    )
    expect(screen.getByTestId('search-error')).toBeInTheDocument()
  })
})
