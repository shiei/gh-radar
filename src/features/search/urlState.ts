import {
  DEFAULT_FILTERS,
  MAX_PAGE,
  MIN_STARS_OPTIONS,
  SEARCH_TYPES,
  type MinStars,
  type SearchFilters,
  type SearchSort,
  type SearchType,
} from '../../lib/github'

/** The part of the search state that a link can carry. */
export interface UrlSearchState {
  type: SearchType
  query: string
  sort: SearchSort
  page: number
  filters: SearchFilters
}

export const URL_DEFAULTS: UrlSearchState = {
  type: 'repositories',
  query: '',
  sort: 'best',
  page: 1,
  filters: DEFAULT_FILTERS,
}

const SORTS: readonly SearchSort[] = ['best', 'stars', 'updated']

function pick<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return raw !== null && allowed.some((v) => v === raw) ? (raw as T) : fallback
}

function parsePage(raw: string | null): number {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return 1
  return Math.min(n, MAX_PAGE)
}

/**
 * Query string for a search state, or '' before anything was submitted. Defaults are left out
 * so links stay short: `?q=react`, `?q=react&sort=stars&page=2&lang=Rust&exclude=forks,archived`.
 * Sort and filters only shape repository searches, so they are only written for that type.
 */
export function buildSearchUrl(state: UrlSearchState): string {
  const query = state.query.trim()
  if (!query) return ''
  const params = new URLSearchParams()
  params.set('q', query)
  if (state.type !== 'repositories') params.set('type', state.type)
  if (state.type === 'repositories') {
    if (state.sort !== 'best') params.set('sort', state.sort)
    const { language, minStars, excludeForks, excludeArchived } = state.filters
    if (language) params.set('lang', language)
    if (minStars !== 0) params.set('stars', String(minStars))
    const exclude = [excludeForks && 'forks', excludeArchived && 'archived'].filter(Boolean)
    if (exclude.length > 0) params.set('exclude', exclude.join(','))
  }
  if (state.page > 1) params.set('page', String(state.page))
  return `?${params.toString()}`
}

/** The search a query string describes, or null when it has no `q`. Unknown values fall back to defaults. */
export function parseSearchUrl(search: string): UrlSearchState | null {
  const params = new URLSearchParams(search)
  const query = params.get('q')?.trim() ?? ''
  if (!query) return null
  const type = pick(params.get('type'), SEARCH_TYPES, 'repositories')
  const sort = pick(params.get('sort'), SORTS, 'best')
  const lang = params.get('lang')?.trim() ?? ''
  const stars = Number(params.get('stars'))
  const minStars = MIN_STARS_OPTIONS.some((v) => v === stars) ? (stars as MinStars) : 0
  const exclude = new Set((params.get('exclude') ?? '').split(',').map((s) => s.trim()))
  return {
    type,
    query,
    sort,
    page: parsePage(params.get('page')),
    filters: {
      language: lang.length > 0 ? lang : null,
      minStars,
      excludeForks: exclude.has('forks'),
      excludeArchived: exclude.has('archived'),
    },
  }
}
