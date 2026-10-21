import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildSearchPath, composeQuery, search } from './search'
import { searchTopics, toTopic } from './topics'
import { DEFAULT_FILTERS, type SearchFilters, type SearchRequest } from './types'
import { searchUsers, toUser } from './users'

const filters = (patch: Partial<SearchFilters>): SearchFilters => ({ ...DEFAULT_FILTERS, ...patch })

describe('composeQuery', () => {
  it('returns the trimmed query when no filter is set', () => {
    expect(composeQuery('  cli ', DEFAULT_FILTERS)).toBe('cli')
  })

  it('appends one qualifier per active filter, in a fixed order', () => {
    expect(
      composeQuery(
        'cli',
        filters({ language: 'Rust', minStars: 1000, excludeForks: true, excludeArchived: true }),
      ),
    ).toBe('cli language:Rust stars:>=1000 fork:false archived:false')
  })

  it('quotes languages that contain spaces', () => {
    expect(composeQuery('plot', filters({ language: 'Jupyter Notebook' }))).toBe(
      'plot language:"Jupyter Notebook"',
    )
  })

  it('does not require a query when filters alone are set', () => {
    expect(composeQuery('', filters({ minStars: 100 }))).toBe('stars:>=100')
  })
})

describe('buildSearchPath by type', () => {
  it('composes filters into the repositories q parameter', () => {
    expect(
      buildSearchPath({
        type: 'repositories',
        query: 'cli',
        sort: 'stars',
        page: 1,
        filters: filters({ language: 'Go' }),
      }),
    ).toBe('/search/repositories?q=cli+language%3AGo&sort=stars&order=desc&per_page=10&page=1')
  })

  it('ignores sort and filters for users and topics', () => {
    expect(
      buildSearchPath({
        type: 'users',
        query: 'react',
        sort: 'stars',
        page: 2,
        filters: filters({ language: 'Go' }),
      }),
    ).toBe('/search/users?q=react&per_page=10&page=2')
    expect(buildSearchPath({ type: 'topics', query: 'react', sort: 'updated', page: 1 })).toBe(
      '/search/topics?q=react&per_page=10&page=1',
    )
  })

  it('accepts a custom page size for count-only requests', () => {
    expect(buildSearchPath({ type: 'topics', query: 'x', sort: 'best', page: 1, perPage: 1 })).toBe(
      '/search/topics?q=x&per_page=1&page=1',
    )
  })
})

describe('toUser / toTopic', () => {
  it('trims a user to what the card needs', () => {
    expect(
      toUser({
        id: 7,
        login: 'octo',
        avatar_url: 'https://avatars.githubusercontent.com/u/7?v=4',
        html_url: 'https://github.com/octo',
        type: 'Organization',
      }),
    ).toEqual({
      id: 7,
      login: 'octo',
      avatarUrl: 'https://avatars.githubusercontent.com/u/7?v=4',
      htmlUrl: 'https://github.com/octo',
      kind: 'Organization',
    })
    expect(toUser({ id: 1, login: 'a', html_url: 'https://github.com/a' })).toMatchObject({
      avatarUrl: null,
      kind: 'User',
    })
  })

  it('trims a topic and blanks empty strings', () => {
    expect(
      toTopic({
        name: 'machine-learning',
        display_name: 'Machine learning',
        short_description: '  ',
        featured: true,
      }),
    ).toEqual({
      name: 'machine-learning',
      displayName: 'Machine learning',
      shortDescription: null,
      featured: true,
      curated: false,
    })
  })
})

/** fetch's first argument as a plain URL string. */
function urlOf(input: RequestInfo | URL | undefined): string {
  if (input === undefined) return ''
  if (typeof input === 'string') return input
  return input instanceof URL ? input.href : input.url
}

describe('searchUsers / searchTopics / search', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  function respond(body: unknown) {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
  }

  it('searchUsers hits /search/users and maps items', async () => {
    respond({
      total_count: 1,
      incomplete_results: false,
      items: [{ id: 1, login: 'octo', html_url: 'https://github.com/octo', type: 'User' }],
    })
    const result = await searchUsers({ query: 'octo', page: 1 })
    expect(urlOf(fetchMock.mock.calls[0]?.[0])).toBe(
      'https://api.github.com/search/users?q=octo&per_page=10&page=1',
    )
    expect(result).toEqual({
      ok: true,
      data: {
        totalCount: 1,
        incompleteResults: false,
        items: [
          {
            id: 1,
            login: 'octo',
            avatarUrl: null,
            htmlUrl: 'https://github.com/octo',
            kind: 'User',
          },
        ],
      },
    })
  })

  it('searchTopics hits /search/topics and maps items', async () => {
    respond({ total_count: 1, incomplete_results: false, items: [{ name: 'react' }] })
    const result = await searchTopics({ query: 'react', page: 3 })
    expect(urlOf(fetchMock.mock.calls[0]?.[0])).toBe(
      'https://api.github.com/search/topics?q=react&per_page=10&page=3',
    )
    expect(result.ok && result.data.items[0]?.name).toBe('react')
  })

  it('search() tags the result with its type and passes errors through', async () => {
    respond({ total_count: 0, incomplete_results: false, items: [] })
    const req: SearchRequest = {
      type: 'topics',
      query: 'x',
      sort: 'best',
      page: 1,
      filters: DEFAULT_FILTERS,
    }
    expect(await search(req)).toEqual({
      ok: true,
      data: { type: 'topics', totalCount: 0, incompleteResults: false, items: [] },
    })
    fetchMock.mockResolvedValue(new Response('', { status: 422 }))
    expect(await search({ ...req, type: 'users' })).toEqual({
      ok: false,
      error: { kind: 'invalid_query' },
    })
  })
})
