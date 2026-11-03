import { describe, expect, it } from 'vitest'

import { DEFAULT_FILTERS } from '../../lib/github'
import { buildSearchUrl, parseSearchUrl, URL_DEFAULTS } from './urlState'

describe('buildSearchUrl', () => {
  it('is empty without a query and omits defaults', () => {
    expect(buildSearchUrl(URL_DEFAULTS)).toBe('')
    expect(buildSearchUrl({ ...URL_DEFAULTS, query: ' react ' })).toBe('?q=react')
  })

  it('writes sort, filters and page for repositories', () => {
    expect(
      buildSearchUrl({
        type: 'repositories',
        query: 'topic:ai',
        sort: 'stars',
        page: 2,
        filters: { language: 'Rust', minStars: 1000, excludeForks: true, excludeArchived: true },
      }),
    ).toBe('?q=topic%3Aai&sort=stars&lang=Rust&stars=1000&exclude=forks%2Carchived&page=2')
  })

  it('drops sort and filters for the other types', () => {
    expect(
      buildSearchUrl({
        type: 'users',
        query: 'torvalds',
        sort: 'stars',
        page: 1,
        filters: { ...DEFAULT_FILTERS, language: 'C' },
      }),
    ).toBe('?q=torvalds&type=users')
  })
})

describe('parseSearchUrl', () => {
  it('returns null without q', () => {
    expect(parseSearchUrl('')).toBeNull()
    expect(parseSearchUrl('?q=%20&type=users')).toBeNull()
  })

  it('round-trips what buildSearchUrl writes', () => {
    const state = {
      type: 'repositories' as const,
      query: 'topic:ai',
      sort: 'updated' as const,
      page: 5,
      filters: {
        language: 'Go',
        minStars: 100 as const,
        excludeForks: false,
        excludeArchived: true,
      },
    }
    expect(parseSearchUrl(buildSearchUrl(state))).toEqual(state)
  })

  it('falls back to defaults for unknown or malformed values', () => {
    expect(parseSearchUrl('?q=x&type=gists&sort=random&page=0&stars=7&exclude=none')).toEqual({
      ...URL_DEFAULTS,
      query: 'x',
    })
    expect(parseSearchUrl('?q=x&page=99999')?.page).toBe(100)
    expect(parseSearchUrl('?q=x&page=abc')?.page).toBe(1)
  })
})
