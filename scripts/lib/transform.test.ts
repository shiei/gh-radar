import { describe, expect, it } from 'vitest'

import {
  appendSeries,
  applyDeltas,
  buildLatest,
  buildMeta,
  historyDays,
  downsamplePoints,
  mergeSources,
  pruneDaily,
  seriesBuckets,
  starDelta,
  toRecord,
  type RawRepo,
  type SeriesPoint,
} from './transform'

const raw = (full_name: string, stars = 10): RawRepo => ({
  full_name,
  stargazers_count: stars,
  forks_count: 2,
  open_issues_count: 1,
  pushed_at: '2026-10-20T00:00:00Z',
  created_at: '2020-01-01T00:00:00Z',
  language: 'TypeScript',
  description: 'Does a thing',
  archived: false,
})

describe('mergeSources + buildLatest', () => {
  it('dedupes across sources and tags every source', () => {
    const merged = mergeSources([
      { source: 'frontend:popular', repos: [raw('vercel/next.js', 100), raw('a/b')] },
      { source: 'watchlist', repos: [raw('vercel/next.js', 101)] },
    ])
    expect(merged.size).toBe(2)
    const latest = buildLatest(merged, '2026-10-21')
    expect(latest.repos['vercel/next.js']).toMatchObject({
      s: 101,
      src: ['frontend:popular', 'watchlist'],
    })
    expect(Object.keys(latest.repos)).toEqual(['a/b', 'vercel/next.js'])
  })
})

describe('toRecord', () => {
  it('keeps the owner id when present', () => {
    expect(toRecord({ ...raw('a/b'), owner: { id: 42 } }, ['x']).o).toBe(42)
    expect('o' in toRecord(raw('a/b'), ['x'])).toBe(false)
  })

  it('maps every field and defaults the optional ones', () => {
    const r = toRecord(
      {
        ...raw('a/b'),
        language: undefined,
        description: '  ',
        archived: undefined,
        forks_count: undefined,
        open_issues_count: undefined,
      },
      ['x'],
    )
    expect(r).toEqual({
      s: 10,
      f: 0,
      i: 0,
      p: '2026-10-20T00:00:00Z',
      c: '2020-01-01T00:00:00Z',
      l: null,
      d: null,
      a: false,
      src: ['x'],
    })
  })
})

describe('appendSeries', () => {
  it('appends in date order and is idempotent for the same date', () => {
    const base = {
      'a/b': [
        ['2026-10-19', 5],
        ['2026-10-20', 7],
      ] as SeriesPoint[],
    }
    const repos = { 'a/b': toRecord(raw('a/b', 9), ['x']), 'c/d': toRecord(raw('c/d', 1), ['x']) }
    const once = appendSeries(base, '2026-10-21', repos)
    const twice = appendSeries(once, '2026-10-21', { 'a/b': toRecord(raw('a/b', 10), ['x']) })
    expect(twice['a/b']).toEqual([
      ['2026-10-19', 5],
      ['2026-10-20', 7],
      ['2026-10-21', 10],
    ])
    expect(twice['c/d']).toEqual([['2026-10-21', 1]])
  })
})

describe('pruneDaily', () => {
  it('lists dates older than 30 days', () => {
    const out = pruneDaily(['2026-10-25', '2026-10-26', '2026-11-25', '2026-09-01'], '2026-11-25')
    expect(out).toEqual(['2026-09-01', '2026-10-25'])
  })
})

describe('downsamplePoints', () => {
  it('keeps daily points within 365 days and one per ISO week beyond', () => {
    const points: SeriesPoint[] = []
    for (let i = 400; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(2026, 9, 21) - i * 86400000).toISOString().slice(0, 10)
      points.push([d, 1000 - i])
    }
    const out = downsamplePoints(points, '2026-10-21')
    const recent = out.filter(([d]) => new Date(d).getTime() >= Date.UTC(2025, 9, 21))
    const older = out.filter(([d]) => new Date(d).getTime() < Date.UTC(2025, 9, 21))
    expect(recent).toHaveLength(366)
    expect(older.length).toBeGreaterThanOrEqual(5)
    expect(older.length).toBeLessThanOrEqual(7)
    expect(out.map(([d]) => d)).toEqual([...out.map(([d]) => d)].sort())
  })
})

describe('seriesBuckets + buildMeta', () => {
  it('maps sources to category buckets and counts per source', () => {
    expect(seriesBuckets(['frontend:popular', 'frontend:rising', 'watchlist'])).toEqual([
      'frontend',
      'watchlist',
    ])
    const latest = buildLatest(
      mergeSources([{ source: 'devops:popular', repos: [raw('a/b'), raw('c/d')] }]),
      '2026-10-21',
    )
    const meta = buildMeta(latest, new Date('2026-10-21T00:04:00Z'), 1, 14.5)
    expect(meta).toEqual({
      lastRun: '2026-10-21T00:04:00.000Z',
      date: '2026-10-21',
      total: 2,
      sources: { 'devops:popular': 2 },
      mapVersion: 1,
      historyDays: 14.5,
    })
  })
})

describe('starDelta + historyDays', () => {
  const day = (offset: number) =>
    new Date(Date.UTC(2026, 10, 20) - offset * 86400000).toISOString().slice(0, 10)

  it('uses the last point on or before the 30-day cutoff as baseline', () => {
    const points: SeriesPoint[] = [
      [day(40), 100],
      [day(31), 120],
      [day(29), 130],
      [day(0), 200],
    ]
    expect(starDelta(points, day(0))).toBe(80)
    expect(
      starDelta(
        [
          [day(5), 10],
          [day(0), 25],
        ],
        day(0),
      ),
    ).toBe(15)
    expect(starDelta([[day(0), 25]], day(0))).toBeNull()
    expect(starDelta(undefined, day(0))).toBeNull()
    expect(historyDays({ a: points })).toBe(40)
    expect(historyDays({})).toBe(0)
  })
})

describe('applyDeltas', () => {
  it('writes r from whichever bucket holds the series and drops stale values', () => {
    const latest = buildLatest(
      mergeSources([
        { source: 'frontend:popular', repos: [raw('a/b', 120)] },
        { source: 'devops:popular', repos: [raw('c/d', 50)] },
      ]),
      '2026-10-21',
    )
    latest.repos['a/b'].r = 999 // from a previous run; must not survive
    const out = applyDeltas(
      latest,
      {
        frontend: {
          'a/b': [
            ['2026-10-11', 100],
            ['2026-10-21', 120],
          ],
        },
        devops: { 'c/d': [['2026-10-21', 50]] },
      },
      '2026-10-21',
    )
    expect(out.repos['a/b']?.r).toBe(20)
    expect('r' in out.repos['c/d']).toBe(false)
    expect(latest.repos['a/b']?.r).toBe(999) // input untouched
  })
})
