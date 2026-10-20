import type { SnapshotLatest, SnapshotRecord, SnapshotRepo } from './types'

export function decodeRecord(fullName: string, record: SnapshotRecord): SnapshotRepo {
  const [owner = '', name = ''] = fullName.split('/')
  return {
    fullName,
    owner,
    name,
    stars: record.s,
    forks: record.f,
    openIssues: record.i,
    pushedAt: record.p,
    createdAt: record.c,
    language: record.l,
    topics: record.t,
    archived: record.a,
    sources: record.src,
  }
}

export function decodeLatest(latest: SnapshotLatest): SnapshotRepo[] {
  return Object.entries(latest.repos).map(([fullName, record]) => decodeRecord(fullName, record))
}

/** Public avatar URL that needs no API call: GitHub redirects owner.png to the avatar. */
export function avatarUrl(owner: string, size = 48): string {
  return `https://github.com/${owner}.png?size=${String(size)}`
}
