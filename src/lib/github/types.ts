export type SearchSort = 'best' | 'stars' | 'updated'

/** What the search looks for. Repositories is the default; the other two have no sort. */
export type SearchType = 'repositories' | 'users' | 'topics'
export const SEARCH_TYPES: readonly SearchType[] = ['repositories', 'users', 'topics']

export type MinStars = 0 | 100 | 1000 | 10000
export const MIN_STARS_OPTIONS: readonly MinStars[] = [0, 100, 1000, 10000]

/** Structured repository filters; turned into qualifiers by composeQuery(). */
export interface SearchFilters {
  /** GitHub language name as shown on repositories, or null for any. */
  language: string | null
  minStars: MinStars
  excludeForks: boolean
  excludeArchived: boolean
}

export const DEFAULT_FILTERS: SearchFilters = {
  language: null,
  minStars: 0,
  excludeForks: false,
  excludeArchived: false,
}

/** Parameters of a repository search. `filters` defaults to none. */
export interface SearchParams {
  query: string
  sort: SearchSort
  page: number
  filters?: SearchFilters
}

/** One search of any type, as the state machine and the cache see it. */
export interface SearchRequest {
  type: SearchType
  query: string
  sort: SearchSort
  page: number
  filters: SearchFilters
}

/** The subset of a GitHub repository the UI needs. */
export interface Repository {
  id: number
  owner: string
  /** Owner avatar (CDN URL, no API quota). Null when GitHub omits it. */
  avatarUrl: string | null
  name: string
  fullName: string
  htmlUrl: string
  description: string | null
  stars: number
  language: string | null
  updatedAt: string
  topics: string[]
  license: string | null
  /** Last code push (real activity), unlike updatedAt which moves on metadata changes. */
  pushedAt: string
  createdAt: string
  archived: boolean
  isFork: boolean
  isTemplate: boolean
  /** Includes pull requests, as GitHub counts them. */
  openIssues: number
  forks: number
  ownerType: 'User' | 'Organization'
  homepage: string | null
  sizeKb: number
}

export interface SearchResult {
  totalCount: number
  incompleteResults: boolean
  items: Repository[]
}

export interface UserResult {
  id: number
  login: string
  avatarUrl: string | null
  htmlUrl: string
  kind: 'User' | 'Organization'
}

export interface TopicResult {
  name: string
  displayName: string | null
  shortDescription: string | null
  featured: boolean
  curated: boolean
}

interface Page<T> {
  totalCount: number
  incompleteResults: boolean
  items: T[]
}

/** Search result tagged with its type so the UI can pick the right card. */
export type AnySearchResult =
  | ({ type: 'repositories' } & Page<Repository>)
  | ({ type: 'users' } & Page<UserResult>)
  | ({ type: 'topics' } & Page<TopicResult>)

export const PAGE_SIZE = 10
/** GitHub search exposes at most the first 1000 results. */
export const MAX_RESULTS = 1000
export const MAX_PAGE = Math.ceil(MAX_RESULTS / PAGE_SIZE)
