import { describe, expect, it } from 'vitest'

import { rankPopular, rankRising, risingWindowDays } from './rankings'
import type { SnapshotRepo } from './snapshot'

const repo = (
  fullName: string,
  stars: number,
  sources: string[],
  createdAt = '2020-01-01T00:00:00Z',
  delta: number | null = null,
): SnapshotRepo => ({
  fullName,
  owner: fullName.split('/')[0] ?? '',
  name: fullName.split('/')[1] ?? '',
  stars,
  forks: 0,
  openIssues: 0,
  pushedAt: '',
  createdAt,
  language: null,
  description: null,
  archived: false,
  ownerId: null,
  sources,
  delta,
})
const today = new Date('2026-11-20T00:00:00Z')

describe('rankPopular', () => {
  it('orders by stars and filters by category source prefix', () => {
    const repos = [
      repo('a/x', 10, ['frontend:popular']),
      repo('b/y', 50, ['devops:rising']),
      repo('c/z', 30, ['frontend:rising']),
    ]
    expect(rankPopular(repos, null).map((r) => r.repo.fullName)).toEqual(['b/y', 'c/z', 'a/x'])
    expect(rankPopular(repos, 'frontend').map((r) => r.repo.fullName)).toEqual(['c/z', 'a/x'])
  })
})

describe('risingWindowDays', () => {
  it('reports the real window while history is short and caps at 30', () => {
    expect(risingWindowDays(0)).toBe(1)
    expect(risingWindowDays(13.9)).toBe(13)
    expect(risingWindowDays(45)).toBe(30)
  })
})

describe('rankRising', () => {
  const repos = [
    repo('a/x', 500, ['frontend:popular'], '2026-10-01T00:00:00Z', 400),
    repo('b/y', 300, ['frontend:rising'], '2026-11-01T00:00:00Z', 10),
    repo('c/z', 900, ['devops:popular'], '2019-01-01T00:00:00Z', 0),
    repo('d/w', 50, ['devops:popular'], '2019-01-01T00:00:00Z', null),
  ]

  it('falls back to recently created repositories when history is short', () => {
    const out = rankRising(repos, 3, today, null)
    expect(out.mode).toBe('fallback')
    expect(out.items.map((i) => i.repo.fullName)).toEqual(['a/x', 'b/y'])
    expect(out.items[0]?.delta).toBeUndefined()
  })

  it('ranks by the precomputed delta once there is enough history', () => {
    const out = rankRising(repos, 14, today, null)
    expect(out.mode).toBe('delta')
    expect(out.items.map((i) => [i.repo.fullName, i.delta])).toEqual([
      ['a/x', 400],
      ['b/y', 10],
    ])
    // Zero or missing deltas never rank; category filtering applies.
    expect(rankRising(repos, 14, today, 'devops').items).toEqual([])
  })
})
