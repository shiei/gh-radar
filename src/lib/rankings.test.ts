import { describe, expect, it } from 'vitest'

import { historyDays, rankPopular, rankRising, starDelta } from './rankings'
import type { Series, SnapshotRepo } from './snapshot'

const repo = (
  fullName: string,
  stars: number,
  sources: string[],
  createdAt = '2020-01-01T00:00:00Z',
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
  topics: [],
  archived: false,
  sources,
})
const today = new Date('2026-11-20T00:00:00Z')
const day = (offset: number) =>
  new Date(today.getTime() - offset * 86400000).toISOString().slice(0, 10)

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

describe('starDelta + historyDays', () => {
  it('uses the last point on or before the 30-day cutoff as baseline', () => {
    const points: Series[string] = [
      [day(40), 100],
      [day(31), 120],
      [day(29), 130],
      [day(0), 200],
    ]
    expect(starDelta(points, today)).toBe(80)
    expect(
      starDelta(
        [
          [day(5), 10],
          [day(0), 25],
        ],
        today,
      ),
    ).toBe(15)
    expect(starDelta([[day(0), 25]], today)).toBeNull()
    expect(historyDays({ a: points })).toBe(40)
  })
})

describe('rankRising', () => {
  const repos = [
    repo('a/x', 500, ['frontend:popular'], '2026-10-01T00:00:00Z'),
    repo('b/y', 300, ['frontend:rising'], '2026-11-01T00:00:00Z'),
    repo('c/z', 900, ['devops:popular'], '2019-01-01T00:00:00Z'),
  ]

  it('falls back to recently created repositories when history is short', () => {
    const series: Series = {
      'a/x': [
        [day(2), 490],
        [day(0), 500],
      ],
    }
    const out = rankRising(repos, series, today, null)
    expect(out.mode).toBe('fallback')
    expect(out.items.map((i) => i.repo.fullName)).toEqual(['a/x', 'b/y'])
  })

  it('ranks by 30-day delta once there is enough history', () => {
    const series: Series = {
      'a/x': [
        [day(35), 100],
        [day(0), 500],
      ],
      'b/y': [
        [day(35), 290],
        [day(0), 300],
      ],
      'c/z': [
        [day(35), 900],
        [day(0), 900],
      ],
    }
    const out = rankRising(repos, series, today, null)
    expect(out.mode).toBe('delta')
    expect(out.items.map((i) => [i.repo.fullName, i.delta])).toEqual([
      ['a/x', 400],
      ['b/y', 10],
    ])
    expect(rankRising(repos, series, today, 'devops').items).toEqual([])
  })
})
