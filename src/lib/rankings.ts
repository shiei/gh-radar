import type { CategoryId } from './categories'
import type { Series, SnapshotRepo } from './snapshot'

export const RISING_DELTA_DAYS = 30
/** Below this much history, rising falls back to "created recently, by stars". */
export const MIN_HISTORY_DAYS = 7
export const RANKING_TOP = 5
export const RANKING_ALL = 30
const FALLBACK_CREATED_DAYS = 90
const DAY_MS = 86400000

export interface RankedRepo {
  repo: SnapshotRepo
  /** Stars gained over the delta window; undefined in popular and fallback modes. */
  delta?: number
}

export function inCategory(repo: SnapshotRepo, category: CategoryId | null): boolean {
  if (!category) return true
  return repo.sources.some((s) => s.startsWith(`${category}:`))
}

export function rankPopular(
  repos: SnapshotRepo[],
  category: CategoryId | null,
  limit = RANKING_ALL,
): RankedRepo[] {
  return repos
    .filter((r) => inCategory(r, category))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit)
    .map((repo) => ({ repo }))
}

/** Longest span (in days) covered by any series, i.e. how much history the dataset has. */
export function historyDays(series: Series): number {
  let max = 0
  for (const points of Object.values(series)) {
    const first = points[0]?.[0]
    const last = points[points.length - 1]?.[0]
    if (!first || !last) continue
    max = Math.max(max, (new Date(last).getTime() - new Date(first).getTime()) / DAY_MS)
  }
  return max
}

/** Stars at the latest point minus stars at the last point on or before `today - 30d` (or the first point). */
export function starDelta(points: Series[string] | undefined, today: Date): number | null {
  if (!points || points.length < 2) return null
  const cutoff = today.getTime() - RISING_DELTA_DAYS * DAY_MS
  let baseline = points[0]!
  for (const point of points) {
    if (new Date(point[0]).getTime() <= cutoff) baseline = point
    else break
  }
  const last = points[points.length - 1]!
  if (baseline === last) baseline = points[0]!
  return last[1] - baseline[1]
}

export type RisingResult =
  { mode: 'delta'; items: RankedRepo[] } | { mode: 'fallback'; items: RankedRepo[] }

export function rankRising(
  repos: SnapshotRepo[],
  series: Series,
  today: Date,
  category: CategoryId | null,
  limit = RANKING_ALL,
): RisingResult {
  const pool = repos.filter((r) => inCategory(r, category))
  if (historyDays(series) < MIN_HISTORY_DAYS) {
    const since = today.getTime() - FALLBACK_CREATED_DAYS * DAY_MS
    const items = pool
      .filter((r) => new Date(r.createdAt).getTime() >= since)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, limit)
      .map((repo) => ({ repo }))
    return { mode: 'fallback', items }
  }
  const items = pool
    .map((repo) => ({ repo, delta: starDelta(series[repo.fullName], today) }))
    .filter((x): x is { repo: SnapshotRepo; delta: number } => x.delta !== null && x.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit)
  return { mode: 'delta', items }
}
