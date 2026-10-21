/** Compact on-disk record written by scripts/snapshot.ts. */
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
  /** Owner's numeric id, for direct avatar URLs. Absent in older snapshots. */
  o?: number
}

export interface SnapshotLatest {
  date: string
  repos: Record<string, SnapshotRecord>
}

export interface SnapshotMeta {
  lastRun: string
  date: string
  total: number
  sources: Record<string, number>
  mapVersion: number
}

export type SeriesPoint = [date: string, stars: number]
export type Series = Record<string, SeriesPoint[]>

/** Decoded, readable form used by the UI. */
export interface SnapshotRepo {
  fullName: string
  owner: string
  name: string
  stars: number
  forks: number
  openIssues: number
  pushedAt: string
  createdAt: string
  language: string | null
  topics: string[]
  archived: boolean
  sources: string[]
  ownerId: number | null
}
