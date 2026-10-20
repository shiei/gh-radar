import { CATEGORY_IDS } from '../categories'
import type { Series, SnapshotLatest, SnapshotMeta } from './types'

/** Base-aware so the site also works under a project path such as /gh-radar/. */
export const DATA_BASE = `${import.meta.env.BASE_URL}data`
export const SERIES_BUCKETS = [...CATEGORY_IDS, 'watchlist'] as const

export interface SnapshotBundle {
  meta: SnapshotMeta
  latest: SnapshotLatest
  /** Merged across every bucket; a repo in several buckets has identical points. */
  series: Series
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

/** Load meta, latest and every series file. Series files that are missing are treated as empty. */
export async function loadSnapshot(fetchImpl: typeof fetch = fetch): Promise<SnapshotLoad> {
  const meta = await getJson<SnapshotMeta>('/meta.json', fetchImpl)
  if (meta === 'missing') return { kind: 'missing' }
  if (meta === 'error') return { kind: 'error' }
  const latest = await getJson<SnapshotLatest>('/latest.json', fetchImpl)
  if (latest === 'missing') return { kind: 'missing' }
  if (latest === 'error') return { kind: 'error' }
  const series: Series = {}
  for (const bucket of SERIES_BUCKETS) {
    const part = await getJson<Series>(`/series/${bucket}.json`, fetchImpl)
    if (part === 'error') return { kind: 'error' }
    if (part === 'missing') continue
    Object.assign(series, part)
  }
  return { kind: 'ready', bundle: { meta, latest, series } }
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
