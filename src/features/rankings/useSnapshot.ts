import { useCallback, useEffect, useState } from 'react'

import {
  loadSnapshot,
  snapshotAgeDays,
  STALE_AFTER_DAYS,
  type SnapshotBundle,
} from '../../lib/snapshot'

export type SnapshotState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; bundle: SnapshotBundle; ageDays: number; stale: boolean }

let cached: Promise<SnapshotState> | null = null

function load(): Promise<SnapshotState> {
  cached ??= loadSnapshot().then((result): SnapshotState => {
    if (result.kind !== 'ready') {
      cached = null // allow retry
      return { status: result.kind }
    }
    const ageDays = snapshotAgeDays(result.bundle.meta)
    return { status: 'ready', bundle: result.bundle, ageDays, stale: ageDays > STALE_AFTER_DAYS }
  })
  return cached
}

/** Test helper. */
export function resetSnapshotCache() {
  cached = null
}

/** Loads the snapshot dataset once per page and shares it across callers. */
export function useSnapshot(): SnapshotState & { reload: () => void } {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void load().then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [attempt])

  const reload = useCallback(() => {
    cached = null
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, reload }
}
