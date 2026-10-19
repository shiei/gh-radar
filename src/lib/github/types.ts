export type SearchSort = 'best' | 'stars' | 'updated'

export interface SearchParams {
  query: string
  sort: SearchSort
  page: number
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

export const PAGE_SIZE = 10
/** GitHub search exposes at most the first 1000 results. */
export const MAX_RESULTS = 1000
export const MAX_PAGE = Math.ceil(MAX_RESULTS / PAGE_SIZE)
