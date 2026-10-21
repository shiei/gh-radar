import { describe, expect, it, vi } from 'vitest'

import { avatarUrl, decodeRecord } from './decode'
import { loadSnapshot, snapshotAgeDays } from './load'

describe('decodeRecord', () => {
  it('expands the compact keys', () => {
    expect(
      decodeRecord('vercel/next.js', {
        s: 1,
        f: 2,
        i: 3,
        p: 'p',
        c: 'c',
        l: null,
        t: ['a'],
        a: true,
        src: ['x'],
      }),
    ).toEqual({
      fullName: 'vercel/next.js',
      owner: 'vercel',
      name: 'next.js',
      stars: 1,
      forks: 2,
      openIssues: 3,
      pushedAt: 'p',
      createdAt: 'c',
      language: null,
      topics: ['a'],
      archived: true,
      sources: ['x'],
      ownerId: null,
    })
    expect(avatarUrl('vercel')).toBe('https://github.com/vercel.png?size=48')
    expect(avatarUrl('vercel', 14985020)).toBe(
      'https://avatars.githubusercontent.com/u/14985020?s=48&v=4',
    )
  })
})

describe('loadSnapshot', () => {
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
  const urlOf = (input: RequestInfo | URL) =>
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url

  it('merges every series bucket and tolerates missing buckets', async () => {
    const fetchImpl = vi.fn<typeof fetch>((input) => {
      const url = urlOf(input)
      if (url.endsWith('/meta.json')) return Promise.resolve(json({ date: '2026-10-20', total: 1 }))
      if (url.endsWith('/latest.json'))
        return Promise.resolve(json({ date: '2026-10-20', repos: {} }))
      if (url.endsWith('/series/frontend.json'))
        return Promise.resolve(json({ 'a/b': [['2026-10-20', 5]] }))
      return Promise.resolve(json({}, 404))
    })
    const result = await loadSnapshot(fetchImpl)
    expect(result.kind).toBe('ready')
    if (result.kind !== 'ready') return
    expect(result.bundle.series['a/b']).toEqual([['2026-10-20', 5]])
  })

  it('reports missing when meta is absent and error on other failures', async () => {
    expect((await loadSnapshot(vi.fn(() => Promise.resolve(json({}, 404))))).kind).toBe('missing')
    expect((await loadSnapshot(vi.fn(() => Promise.resolve(json({}, 500))))).kind).toBe('error')
    expect((await loadSnapshot(vi.fn(() => Promise.reject(new Error('x'))))).kind).toBe('error')
  })
})

describe('snapshotAgeDays', () => {
  it('counts whole UTC days since the snapshot date', () => {
    const meta = { date: '2026-10-20', lastRun: '', total: 0, sources: {}, mapVersion: 1 }
    expect(snapshotAgeDays(meta, new Date('2026-10-20T23:00:00Z'))).toBe(0)
    expect(snapshotAgeDays(meta, new Date('2026-10-25T01:00:00Z'))).toBe(5)
  })
})
