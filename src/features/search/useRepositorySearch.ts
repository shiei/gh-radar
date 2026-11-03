import { useCallback, useEffect, useReducer, useRef } from 'react'

import {
  search,
  type SearchFilters,
  type SearchRequest,
  type SearchSort,
  type SearchType,
} from '../../lib/github'
import { getCached, invalidateCached, setCached } from './searchCache'
import { initialStateFromUrl, searchReducer, type SearchState } from './searchReducer'
import { buildSearchUrl, parseSearchUrl, URL_DEFAULTS } from './urlState'

export interface RepositorySearch {
  state: SearchState
  /** Submit a query; optionally switch the type at the same time (topic → repositories). */
  submit: (query: string, type?: SearchType) => void
  setType: (type: SearchType) => void
  setSort: (sort: SearchSort) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  goToPage: (page: number) => void
  retry: () => void
}

function toRequest(state: SearchState): SearchRequest {
  const { type, query, sort, page, filters } = state
  return { type, query, sort, page, filters }
}

/**
 * Search state machine. Every request-starting action bumps `requestId`; the
 * effect below sends exactly one request per id, aborts the previous one and
 * tags responses so stale ones are dropped by the reducer.
 */
export function useRepositorySearch(): RepositorySearch {
  const [state, dispatch] = useReducer(searchReducer, undefined, () =>
    initialStateFromUrl(window.location.search),
  )
  const controllerRef = useRef<AbortController | null>(null)
  const { requestId } = state

  useEffect(() => {
    if (requestId === 0) return
    controllerRef.current?.abort()
    if (!state.query) {
      controllerRef.current = null
      return
    }
    const req = toRequest(state)

    // Session cache: a fresh hit answers without a request (and without an AbortController).
    const cached = getCached(req)
    if (cached) {
      controllerRef.current = null
      dispatch({ type: 'succeeded', requestId, result: cached })
      return
    }

    const controller = new AbortController()
    controllerRef.current = controller

    void search(req, controller.signal).then((result) => {
      if (controllerRef.current !== controller) return
      if (result.ok) {
        setCached(req, result.data)
        dispatch({ type: 'succeeded', requestId, result: result.data })
      } else {
        dispatch({ type: 'failed', requestId, error: result.error })
      }
    })

    return () => controller.abort()
    // Request fields only change together with requestId when a request is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  // The URL mirrors every submitted search so links can be shared and back/forward work.
  // The first sync replaces the entry (it only canonicalises what the user opened with);
  // later ones push. A state restored from popstate already matches the URL, so nothing is written.
  const syncedRef = useRef(false)
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const target = `${pathname}${buildSearchUrl(state)}${hash}`
    if (target === `${pathname}${search}${hash}`) {
      syncedRef.current = true
      return
    }
    if (syncedRef.current) window.history.pushState(null, '', target)
    else window.history.replaceState(null, '', target)
    syncedRef.current = true
    // Same reasoning as above: the fields only change together with requestId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  useEffect(() => {
    const onPopState = () =>
      dispatch({ type: 'restore', state: parseSearchUrl(window.location.search) ?? URL_DEFAULTS })
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const submit = useCallback(
    (q: string, type?: SearchType) => dispatch({ type: 'submit', query: q, searchType: type }),
    [],
  )
  const setType = useCallback((t: SearchType) => dispatch({ type: 'setType', searchType: t }), [])
  const setSort = useCallback((s: SearchSort) => dispatch({ type: 'setSort', sort: s }), [])
  const setFilters = useCallback(
    (f: Partial<SearchFilters>) => dispatch({ type: 'setFilters', filters: f }),
    [],
  )
  const goToPage = useCallback((p: number) => dispatch({ type: 'goToPage', page: p }), [])
  const { type, query, sort, page, filters } = state
  const retry = useCallback(() => {
    invalidateCached({ type, query, sort, page, filters })
    dispatch({ type: 'retry' })
  }, [type, query, sort, page, filters])

  return { state, submit, setType, setSort, setFilters, goToPage, retry }
}
