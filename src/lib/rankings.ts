import type { CategoryId } from './categories'
import type { SnapshotRepo } from './snapshot'

/** The window the snapshot job uses for star deltas. Kept in sync with scripts/lib/transform.ts. */
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

/** The window the deltas really cover: 30 days once there is that much history, fewer before. */
export function risingWindowDays(historyDays: number): number {
  return Math.max(1, Math.min(RISING_DELTA_DAYS, Math.floor(historyDays)))
}

export type RisingResult =
  { mode: 'delta'; items: RankedRepo[] } | { mode: 'fallback'; items: RankedRepo[] }

/**
 * Rising Stars from the deltas the snapshot job precomputed. With too little history the
 * deltas are noise, so fall back to young repositories ordered by stars.
 */
export function rankRising(
  repos: SnapshotRepo[],
  historyDays: number,
  today: Date,
  category: CategoryId | null,
  limit = RANKING_ALL,
): RisingResult {
  const pool = repos.filter((r) => inCategory(r, category))
  if (historyDays < MIN_HISTORY_DAYS) {
    const since = today.getTime() - FALLBACK_CREATED_DAYS * DAY_MS
    const items = pool
      .filter((r) => new Date(r.createdAt).getTime() >= since)
      .sort((a, b) => b.stars - a.stars)
      .slice(0, limit)
      .map((repo) => ({ repo }))
    return { mode: 'fallback', items }
  }
  const items = pool
    .map((repo) => ({ repo, delta: repo.delta }))
    .filter((x): x is { repo: SnapshotRepo; delta: number } => x.delta !== null && x.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit)
  return { mode: 'delta', items }
}
