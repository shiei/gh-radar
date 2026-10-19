import type { GitHubError, SearchResult, SearchSort } from '../../lib/github'
import { MAX_PAGE, PAGE_SIZE } from '../../lib/github'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface SearchState {
  /** The submitted query, not the input box content. Empty until the first submit. */
  query: string
  sort: SearchSort
  page: number
  status: SearchStatus
  result: SearchResult | null
  error: GitHubError | null
  /** Increments for every request that should actually be sent. */
  requestId: number
}

export type SearchAction =
  | { type: 'submit'; query: string }
  | { type: 'setSort'; sort: SearchSort }
  | { type: 'goToPage'; page: number }
  | { type: 'retry' }
  | { type: 'succeeded'; requestId: number; result: SearchResult }
  | { type: 'failed'; requestId: number; error: GitHubError }

export const initialSearchState: SearchState = {
  query: '',
  sort: 'best',
  page: 1,
  status: 'idle',
  result: null,
  error: null,
  requestId: 0,
}

/** Last page the user can reach: result-bound and capped by GitHub's 1000-result window. */
export function maxPage(totalCount: number): number {
  return Math.max(1, Math.min(Math.ceil(totalCount / PAGE_SIZE), MAX_PAGE))
}

function startRequest(state: SearchState, patch: Partial<SearchState>): SearchState {
  return {
    ...state,
    ...patch,
    status: 'loading',
    error: null,
    requestId: state.requestId + 1,
  }
}

export function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'submit': {
      const query = action.query.trim()
      if (!query) return state
      return startRequest(state, { query, page: 1 })
    }
    case 'setSort': {
      if (action.sort === state.sort) return state
      if (!state.query) return { ...state, sort: action.sort }
      return startRequest(state, { sort: action.sort, page: 1 })
    }
    case 'goToPage': {
      if (!state.query) return state
      const upper = state.result ? maxPage(state.result.totalCount) : MAX_PAGE
      const page = Math.min(Math.max(1, action.page), upper)
      if (page === state.page) return state
      return startRequest(state, { page })
    }
    case 'retry': {
      if (!state.query) return state
      return startRequest(state, {})
    }
    case 'succeeded': {
      if (action.requestId !== state.requestId) return state
      return {
        ...state,
        status: action.result.totalCount === 0 ? 'empty' : 'success',
        result: action.result,
        error: null,
      }
    }
    case 'failed': {
      if (action.requestId !== state.requestId) return state
      if (action.error.kind === 'aborted') return state
      return { ...state, status: 'error', error: action.error }
    }
  }
}
