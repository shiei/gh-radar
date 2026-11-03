import type { SnapshotLatest, SnapshotMeta } from './types'

/** Base-aware so the site also works under a project path such as /gh-radar/. */
export const DATA_BASE = `${import.meta.env.BASE_URL}data`

/**
 * Everything the rankings need. Star deltas are precomputed by the snapshot job, so the
 * per-repository series files are never downloaded by the site.
 */
export interface SnapshotBundle {
  meta: SnapshotMeta
  latest: SnapshotLatest
}

export type SnapshotLoad =
  { kind: 'ready'; bundle: SnapshotBundle } | { kind: 'missing' } | { kind: 'error' }

async function getJson<T>(path: string, fetchImpl: typeof fetch): Promise<T | 'missing' | 'error'> {
  try {
    const response = await fetchImpl(`${DATA_BASE}${path}`, {
      headers: { Accept: 'application/json' },
    })
    if (response.status === 404) return 'missing'
    if (!response.ok) return 'error'
    return (await response.json()) as T
  } catch {
    return 'error'
  }
}

/** Load meta and latest in parallel. Either missing means no snapshot; any other failure is an error. */
export async function loadSnapshot(fetchImpl: typeof fetch = fetch): Promise<SnapshotLoad> {
  const [meta, latest] = await Promise.all([
    getJson<SnapshotMeta>('/meta.json', fetchImpl),
    getJson<SnapshotLatest>('/latest.json', fetchImpl),
  ])
  if (meta === 'missing' || latest === 'missing') return { kind: 'missing' }
  if (meta === 'error' || latest === 'error') return { kind: 'error' }
  return { kind: 'ready', bundle: { meta, latest } }
}

/** Days between the snapshot date and today (UTC), for the staleness notice. */
export function snapshotAgeDays(meta: SnapshotMeta, now: Date = new Date()): number {
  const snap = Date.UTC(
    Number(meta.date.slice(0, 4)),
    Number(meta.date.slice(5, 7)) - 1,
    Number(meta.date.slice(8, 10)),
  )
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.max(0, Math.round((today - snap) / 86400000))
}

export const STALE_AFTER_DAYS = 3
