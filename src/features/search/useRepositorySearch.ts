import { useCallback, useEffect, useReducer, useRef } from 'react'

import { searchRepositories, type SearchSort } from '../../lib/github'
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
    const controller = new AbortController()
    controllerRef.current = controller

    void searchRepositories({ query, sort, page }, controller.signal).then((result) => {
      if (controllerRef.current !== controller) return
      if (result.ok) dispatch({ type: 'succeeded', requestId, result: result.data })
      else dispatch({ type: 'failed', requestId, error: result.error })
    })

    return () => controller.abort()
    // query/sort/page only change together with requestId when a request is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  const submit = useCallback((q: string) => dispatch({ type: 'submit', query: q }), [])
  const setSort = useCallback((s: SearchSort) => dispatch({ type: 'setSort', sort: s }), [])
  const goToPage = useCallback((p: number) => dispatch({ type: 'goToPage', page: p }), [])
  const retry = useCallback(() => dispatch({ type: 'retry' }), [])

  return { state, submit, setSort, goToPage, retry }
}
