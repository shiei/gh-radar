import { describe, expect, it } from 'vitest'

import type { SearchResult } from '../../lib/github'
import { initialSearchState, maxPage, searchReducer, type SearchState } from './searchReducer'

const result = (totalCount: number): SearchResult => ({
  totalCount,
  incompleteResults: false,
  items: [],
})

function loaded(totalCount = 100, patch: Partial<SearchState> = {}): SearchState {
  const afterSubmit = searchReducer(initialSearchState, { type: 'submit', query: 'react' })
  return {
    ...searchReducer(afterSubmit, {
      type: 'succeeded',
      requestId: afterSubmit.requestId,
      result: result(totalCount),
    }),
    ...patch,
  }
}

describe('maxPage', () => {
  it('derives from total and caps at 100', () => {
    expect(maxPage(0)).toBe(1)
    expect(maxPage(7)).toBe(1)
    expect(maxPage(11)).toBe(2)
    expect(maxPage(5000)).toBe(100)
  })
})

describe('searchReducer', () => {
  it('submit trims, stores the query, resets to page 1 and starts loading', () => {
    const state = searchReducer(
      { ...initialSearchState, page: 5 },
      { type: 'submit', query: '  vue ' },
    )
    expect(state).toMatchObject({ query: 'vue', page: 1, status: 'loading', requestId: 1 })
  })

  it('submit with blank input is a no-op', () => {
    expect(searchReducer(initialSearchState, { type: 'submit', query: '   ' })).toBe(
      initialSearchState,
    )
  })

  it('setSort before any search only remembers the sort', () => {
    const state = searchReducer(initialSearchState, { type: 'setSort', sort: 'stars' })
    expect(state).toMatchObject({ sort: 'stars', status: 'idle', requestId: 0 })
  })

  it('setSort after a search resets to page 1 and reloads', () => {
    const state = searchReducer(loaded(100, { page: 3 }), { type: 'setSort', sort: 'updated' })
    expect(state).toMatchObject({ sort: 'updated', page: 1, status: 'loading', requestId: 2 })
  })

  it('goToPage clamps to the reachable range', () => {
    expect(searchReducer(loaded(5000), { type: 'goToPage', page: 999 }).page).toBe(100)
    expect(searchReducer(loaded(100), { type: 'goToPage', page: 0 }).page).toBe(1)
    expect(searchReducer(loaded(100), { type: 'goToPage', page: 2 })).toMatchObject({
      page: 2,
      status: 'loading',
    })
  })

  it('goToPage to the current page is a no-op', () => {
    const state = loaded(100)
    expect(searchReducer(state, { type: 'goToPage', page: 1 })).toBe(state)
  })

  it('succeeded with zero results is empty', () => {
    const loading = searchReducer(initialSearchState, { type: 'submit', query: 'x' })
    const state = searchReducer(loading, { type: 'succeeded', requestId: 1, result: result(0) })
    expect(state.status).toBe('empty')
  })

  it('failed stores the error', () => {
    const loading = searchReducer(initialSearchState, { type: 'submit', query: 'x' })
    const state = searchReducer(loading, {
      type: 'failed',
      requestId: 1,
      error: { kind: 'network' },
    })
    expect(state).toMatchObject({ status: 'error', error: { kind: 'network' } })
  })

  it('aborted never changes state', () => {
    const loading = searchReducer(initialSearchState, { type: 'submit', query: 'x' })
    expect(
      searchReducer(loading, { type: 'failed', requestId: 1, error: { kind: 'aborted' } }),
    ).toBe(loading)
  })

  it('responses for a stale requestId are ignored', () => {
    const first = searchReducer(initialSearchState, { type: 'submit', query: 'react' })
    const second = searchReducer(first, { type: 'submit', query: 'vue' })
    const late = searchReducer(second, { type: 'succeeded', requestId: 1, result: result(7) })
    expect(late).toBe(second)
    const fresh = searchReducer(second, { type: 'succeeded', requestId: 2, result: result(7) })
    expect(fresh.status).toBe('success')
  })

  it('retry keeps query, sort and page', () => {
    const errored = { ...loaded(100, { page: 2, sort: 'stars' }), status: 'error' as const }
    const state = searchReducer(errored, { type: 'retry' })
    expect(state).toMatchObject({ query: 'react', sort: 'stars', page: 2, status: 'loading' })
  })
})
