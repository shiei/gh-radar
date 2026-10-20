/** Fields we read from GitHub's repository payloads (search items or GET /repos). */
export interface RawRepo {
  full_name: string
  stargazers_count: number
  forks_count?: number
  open_issues_count?: number
  pushed_at: string
  created_at: string
  language?: string | null
  topics?: string[]
  archived?: boolean
}

/** Compact on-disk record. Short keys keep latest.json small. */
export interface SnapshotRecord {
  s: number
  f: number
  i: number
  p: string
  c: string
  l: string | null
  t: string[]
  a: boolean
  src: string[]
}

export interface Latest {
  date: string
  repos: Record<string, SnapshotRecord>
}

export type SeriesPoint = [date: string, stars: number]
export type Series = Record<string, SeriesPoint[]>

export interface Meta {
  lastRun: string
  date: string
  total: number
  sources: Record<string, number>
  mapVersion: number
}

export interface SourceBatch {
  source: string
  repos: RawRepo[]
}

const DAY_MS = 24 * 60 * 60 * 1000

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Deduplicate repositories across sources, tagging each with every source it came from. */
export function mergeSources(
  batches: SourceBatch[],
): Map<string, { raw: RawRepo; sources: string[] }> {
  const merged = new Map<string, { raw: RawRepo; sources: string[] }>()
  for (const batch of batches) {
    for (const raw of batch.repos) {
      const existing = merged.get(raw.full_name)
      if (existing) {
        if (!existing.sources.includes(batch.source)) existing.sources.push(batch.source)
        existing.raw = raw
      } else {
        merged.set(raw.full_name, { raw, sources: [batch.source] })
      }
    }
  }
  return merged
}

export function toRecord(raw: RawRepo, sources: string[]): SnapshotRecord {
  return {
    s: raw.stargazers_count,
    f: raw.forks_count ?? 0,
    i: raw.open_issues_count ?? 0,
    p: raw.pushed_at,
    c: raw.created_at,
    l: raw.language ?? null,
    t: raw.topics ?? [],
    a: raw.archived ?? false,
    src: [...sources].sort(),
  }
}

export function buildLatest(merged: ReturnType<typeof mergeSources>, date: string): Latest {
  const repos: Record<string, SnapshotRecord> = {}
  for (const [fullName, { raw, sources }] of [...merged.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    repos[fullName] = toRecord(raw, sources)
  }
  return { date, repos }
}

/** Append today's star counts. Same-date points are replaced, so reruns are idempotent. */
export function appendSeries(
  series: Series,
  date: string,
  repos: Record<string, SnapshotRecord>,
): Series {
  const next: Series = {}
  for (const [name, points] of Object.entries(series)) next[name] = [...points]
  for (const [name, record] of Object.entries(repos)) {
    // Replace only this repo's same-date point; repos not seen today keep their history untouched.
    const points = (next[name] ?? []).filter(([d]) => d !== date)
    points.push([date, record.s])
    points.sort(([a], [b]) => a.localeCompare(b))
    next[name] = points
  }
  return next
}

/** Dates of daily files older than `keepDays` relative to `today`. */
export function pruneDaily(dates: string[], today: string, keepDays = 30): string[] {
  const cutoff = new Date(new Date(today).getTime() - keepDays * DAY_MS)
  return dates.filter((d) => new Date(d).getTime() < cutoff.getTime()).sort()
}

function isoWeekKey(date: string): string {
  const d = new Date(date)
  const day = (d.getUTCDay() + 6) % 7 // Monday = 0
  d.setUTCDate(d.getUTCDate() - day + 3) // Thursday of this ISO week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const week =
    1 +
    Math.round(
      ((d.getTime() - yearStart.getTime()) / DAY_MS - 3 + ((yearStart.getUTCDay() + 6) % 7)) / 7,
    )
  return `${String(d.getUTCFullYear())}-W${String(week).padStart(2, '0')}`
}

/** Keep daily points for the last `dailyDays`; older points collapse to one per ISO week (the last). */
export function downsamplePoints(
  points: SeriesPoint[],
  today: string,
  dailyDays = 365,
): SeriesPoint[] {
  const cutoff = new Date(new Date(today).getTime() - dailyDays * DAY_MS).getTime()
  const recent = points.filter(([d]) => new Date(d).getTime() >= cutoff)
  const older = points.filter(([d]) => new Date(d).getTime() < cutoff)
  const byWeek = new Map<string, SeriesPoint>()
  for (const point of older) byWeek.set(isoWeekKey(point[0]), point)
  return [...byWeek.values(), ...recent].sort(([a], [b]) => a.localeCompare(b))
}

export function downsampleSeries(series: Series, today: string, dailyDays = 365): Series {
  const next: Series = {}
  for (const [name, points] of Object.entries(series))
    next[name] = downsamplePoints(points, today, dailyDays)
  return next
}

/** Which series file a repository belongs to, from its sources ("frontend:popular" -> "frontend"). */
export function seriesBuckets(sources: string[]): string[] {
  const buckets = new Set<string>()
  for (const src of sources)
    buckets.add(src === 'watchlist' ? 'watchlist' : (src.split(':')[0] ?? src))
  return [...buckets].sort()
}

export function buildMeta(latest: Latest, lastRun: Date, mapVersion: number): Meta {
  const sources: Record<string, number> = {}
  for (const record of Object.values(latest.repos)) {
    for (const src of record.src) sources[src] = (sources[src] ?? 0) + 1
  }
  return {
    lastRun: lastRun.toISOString(),
    date: latest.date,
    total: Object.keys(latest.repos).length,
    sources,
    mapVersion,
  }
}
