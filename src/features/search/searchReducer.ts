import type {
  AnySearchResult,
  GitHubError,
  SearchFilters,
  SearchSort,
  SearchType,
} from '../../lib/github'
import { DEFAULT_FILTERS, MAX_PAGE, PAGE_SIZE } from '../../lib/github'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface SearchState {
  type: SearchType
  /** The submitted query, not the input box content. Empty until the first submit. */
  query: string
  sort: SearchSort
  /** Repository filters; ignored by the other types but kept so switching back restores them. */
  filters: SearchFilters
  page: number
  status: SearchStatus
  result: AnySearchResult | null
  error: GitHubError | null
  /** Increments for every request that should actually be sent. */
  requestId: number
}

export type SearchAction =
  | { type: 'submit'; query: string; searchType?: SearchType }
  | { type: 'setType'; searchType: SearchType }
  | { type: 'setSort'; sort: SearchSort }
  | { type: 'setFilters'; filters: Partial<SearchFilters> }
  | { type: 'goToPage'; page: number }
  | { type: 'retry' }
  | { type: 'succeeded'; requestId: number; result: AnySearchResult }
  | { type: 'failed'; requestId: number; error: GitHubError }

export const initialSearchState: SearchState = {
  type: 'repositories',
  query: '',
  sort: 'best',
  filters: DEFAULT_FILTERS,
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

/** Setting-style actions: without a query only remember the setting, with one re-search page 1. */
function applySetting(state: SearchState, patch: Partial<SearchState>): SearchState {
  if (!state.query) return { ...state, ...patch }
  return startRequest(state, { ...patch, page: 1 })
}

function sameFilters(a: SearchFilters, b: SearchFilters): boolean {
  return (
    a.language === b.language &&
    a.minStars === b.minStars &&
    a.excludeForks === b.excludeForks &&
    a.excludeArchived === b.excludeArchived
  )
}

export function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'submit': {
      const query = action.query.trim()
      if (!query) return state
      return startRequest(state, { query, page: 1, type: action.searchType ?? state.type })
    }
    case 'setType': {
      if (action.searchType === state.type) return state
      return applySetting(state, { type: action.searchType })
    }
    case 'setSort': {
      if (action.sort === state.sort) return state
      return applySetting(state, { sort: action.sort })
    }
    case 'setFilters': {
      const filters = { ...state.filters, ...action.filters }
      if (sameFilters(filters, state.filters)) return state
      // Filters only shape repository searches; for the other types just remember them.
      if (state.type !== 'repositories') return { ...state, filters }
      return applySetting(state, { filters })
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
