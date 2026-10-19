import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildSearchPath, searchRepositories, toRepository } from './search'

const fullRaw = {
  id: 1,
  name: 'react',
  full_name: 'facebook/react',
  html_url: 'https://github.com/facebook/react',
  description: 'The library for web and native user interfaces',
  stargazers_count: 230000,
  language: 'JavaScript',
  updated_at: '2026-10-18T10:00:00Z',
  topics: ['react', 'ui'],
  license: { spdx_id: 'MIT', name: 'MIT License' },
  owner: {
    login: 'facebook',
    avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    type: 'Organization',
  },
  pushed_at: '2026-10-18T12:00:00Z',
  created_at: '2013-05-24T16:15:54Z',
  archived: false,
  fork: false,
  is_template: false,
  open_issues_count: 1100,
  forks_count: 48000,
  homepage: 'https://react.dev',
  size: 500000,
}

describe('buildSearchPath', () => {
  it('omits sort for best match and encodes the query', () => {
    expect(buildSearchPath({ query: ' language:rust cli ', sort: 'best', page: 1 })).toBe(
      '/search/repositories?q=language%3Arust+cli&per_page=10&page=1',
    )
  })

  it('adds sort=stars&order=desc', () => {
    expect(buildSearchPath({ query: 'x', sort: 'stars', page: 2 })).toBe(
      '/search/repositories?q=x&sort=stars&order=desc&per_page=10&page=2',
    )
  })

  it('adds sort=updated&order=desc', () => {
    expect(buildSearchPath({ query: 'x', sort: 'updated', page: 3 })).toContain(
      'sort=updated&order=desc',
    )
  })
})

describe('toRepository', () => {
  it('maps every field', () => {
    expect(toRepository(fullRaw)).toEqual({
      id: 1,
      owner: 'facebook',
      avatarUrl: 'https://avatars.githubusercontent.com/u/69631?v=4',
      name: 'react',
      fullName: 'facebook/react',
      htmlUrl: 'https://github.com/facebook/react',
      description: 'The library for web and native user interfaces',
      stars: 230000,
      language: 'JavaScript',
      updatedAt: '2026-10-18T10:00:00Z',
      topics: ['react', 'ui'],
      license: 'MIT',
      pushedAt: '2026-10-18T12:00:00Z',
      createdAt: '2013-05-24T16:15:54Z',
      archived: false,
      isFork: false,
      isTemplate: false,
      openIssues: 1100,
      forks: 48000,
      ownerType: 'Organization',
      homepage: 'https://react.dev',
      sizeKb: 500000,
    })
  })

  it('maps missing optional fields to null / empty', () => {
    const repo = toRepository({
      ...fullRaw,
      description: null,
      language: null,
      topics: undefined,
      license: null,
    })
    expect(repo.description).toBeNull()
    expect(repo.language).toBeNull()
    expect(repo.topics).toEqual([])
    expect(repo.license).toBeNull()
  })

  it('defaults the extra signals when GitHub omits them', () => {
    const repo = toRepository({
      ...fullRaw,
      owner: { login: 'x' },
      archived: undefined,
      fork: undefined,
      is_template: undefined,
      open_issues_count: undefined,
      forks_count: undefined,
      homepage: '',
      size: undefined,
    })
    expect(repo).toMatchObject({
      archived: false,
      isFork: false,
      isTemplate: false,
      openIssues: 0,
      forks: 0,
      ownerType: 'User',
      homepage: null,
      sizeKb: 0,
    })
  })

  it('falls back to license name when spdx is NOASSERTION', () => {
    const repo = toRepository({ ...fullRaw, license: { spdx_id: 'NOASSERTION', name: 'Other' } })
    expect(repo.license).toBe('Other')
  })
})

describe('searchRepositories', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('returns a trimmed SearchResult and passes incomplete_results through', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ total_count: 1, incomplete_results: true, items: [fullRaw] }), {
        status: 200,
      }),
    )
    const result = await searchRepositories({ query: 'react', sort: 'best', page: 1 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.totalCount).toBe(1)
    expect(result.data.incompleteResults).toBe(true)
    expect(result.data.items[0]?.fullName).toBe('facebook/react')
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api.github.com/search/repositories?q=react&per_page=10&page=1',
    )
  })

  it('propagates errors unchanged', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 422 }))
    expect(await searchRepositories({ query: 'x', sort: 'best', page: 1 })).toEqual({
      ok: false,
      error: { kind: 'invalid_query' },
    })
  })
})
