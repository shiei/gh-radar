import { useCallback, useEffect, useReducer, useRef } from 'react'

import { searchRepositories, type SearchSort } from '../../lib/github'
import { getCached, invalidateCached, setCached } from './searchCache'
import { initialSearchState, searchReducer, type SearchState } from './searchReducer'

export interface RepositorySearch {
  state: SearchState
  submit: (query: string) => void
  setSort: (sort: SearchSort) => void
  goToPage: (page: number) => void
  retry: () => void
}

/**
 * Search state machine. Every request-starting action bumps `requestId`; the
 * effect below sends exactly one request per id, aborts the previous one and
 * tags responses so stale ones are dropped by the reducer.
 */
export function useRepositorySearch(): RepositorySearch {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState)
  const controllerRef = useRef<AbortController | null>(null)
  const { requestId, query, sort, page } = state

  useEffect(() => {
    if (requestId === 0) return
    controllerRef.current?.abort()
    const params = { query, sort, page }

    // Session cache: a fresh hit answers without a request (and without an AbortController).
    const cached = getCached(params)
    if (cached) {
      controllerRef.current = null
      dispatch({ type: 'succeeded', requestId, result: cached })
      return
    }

    const controller = new AbortController()
    controllerRef.current = controller

    void searchRepositories(params, controller.signal).then((result) => {
      if (controllerRef.current !== controller) return
      if (result.ok) {
        setCached(params, result.data)
        dispatch({ type: 'succeeded', requestId, result: result.data })
      } else {
        dispatch({ type: 'failed', requestId, error: result.error })
      }
    })

    return () => controller.abort()
    // query/sort/page only change together with requestId when a request is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  const submit = useCallback((q: string) => dispatch({ type: 'submit', query: q }), [])
  const setSort = useCallback((s: SearchSort) => dispatch({ type: 'setSort', sort: s }), [])
  const goToPage = useCallback((p: number) => dispatch({ type: 'goToPage', page: p }), [])
  const retry = useCallback(() => {
    invalidateCached({ query, sort, page })
    dispatch({ type: 'retry' })
  }, [query, sort, page])

  return { state, submit, setSort, goToPage, retry }
}
