/** Compact on-disk record written by scripts/snapshot.ts. */
export interface SnapshotRecord {
  s: number
  f: number
  i: number
  p: string
  c: string
  l: string | null
  /** Description. Absent in snapshots written before 2026-11-03, which stored topics instead. */
  d?: string | null
  a: boolean
  src: string[]
  /** Owner's numeric id, for direct avatar URLs. Absent in older snapshots. */
  o?: number
  /** Stars gained over the delta window (see SnapshotMeta.historyDays). Absent without history. */
  r?: number
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
  /** Days of history behind the star deltas (30 once mature). Absent in snapshots before 2026-11-04. */
  historyDays?: number
}

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
  description: string | null
  archived: boolean
  sources: string[]
  ownerId: number | null
  /** Stars gained over the snapshot's delta window; null when the snapshot has none for it. */
  delta: number | null
}
