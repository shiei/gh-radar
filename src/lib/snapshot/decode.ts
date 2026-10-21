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
    ownerId: record.o ?? null,
  }
}

export function decodeLatest(latest: SnapshotLatest): SnapshotRepo[] {
  return Object.entries(latest.repos).map(([fullName, record]) => decodeRecord(fullName, record))
}

/**
 * Public avatar URL that needs no API call. With the owner id it goes straight to the avatar
 * CDN; without it GitHub redirects owner.png there (one extra hop).
 */
export function avatarUrl(owner: string, ownerId: number | null = null, size = 48): string {
  if (ownerId !== null)
    return `https://avatars.githubusercontent.com/u/${String(ownerId)}?s=${String(size)}&v=4`
  return `https://github.com/${owner}.png?size=${String(size)}`
}
