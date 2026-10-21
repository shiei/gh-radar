import type { Result } from './errors'
import { request } from './request'
import { searchTopics } from './topics'
import {
  DEFAULT_FILTERS,
  PAGE_SIZE,
  type AnySearchResult,
  type Repository,
  type SearchFilters,
  type SearchParams,
  type SearchRequest,
  type SearchResult,
  type SearchSort,
  type SearchType,
} from './types'
import { searchUsers } from './users'

/** Raw shape of the fields we read from GitHub's search payload. */
interface RawRepository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  updated_at: string
  topics?: string[]
  license: { spdx_id?: string | null; name?: string } | null
  owner: { login: string; avatar_url?: string; type?: string }
  pushed_at: string
  created_at: string
  archived?: boolean
  fork?: boolean
  is_template?: boolean
  open_issues_count?: number
  forks_count?: number
  homepage?: string | null
  size?: number
}

interface RawSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: RawRepository[]
}

const SORT_PARAM: Record<SearchSort, string | null> = {
  best: null,
  stars: 'stars',
  updated: 'updated',
}

/** GitHub wants quotes around qualifier values that contain spaces (`language:"Jupyter Notebook"`). */
function qualifierValue(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value
}

/**
 * The user's query followed by the qualifiers the filters stand for. The input box
 * keeps showing the plain query; only the request sees this string.
 */
export function composeQuery(query: string, filters: SearchFilters = DEFAULT_FILTERS): string {
  return [
    query.trim(),
    filters.language ? `language:${qualifierValue(filters.language)}` : '',
    filters.minStars > 0 ? `stars:>=${String(filters.minStars)}` : '',
    filters.excludeForks ? 'fork:false' : '',
    filters.excludeArchived ? 'archived:false' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export interface SearchPathParams extends SearchParams {
  type?: SearchType
  perPage?: number
}

/** Repositories take sort and filters; users and topics only the plain query. */
export function buildSearchPath({
  type = 'repositories',
  query,
  sort,
  page,
  filters,
  perPage = PAGE_SIZE,
}: SearchPathParams): string {
  const params = new URLSearchParams()
  const isRepositories = type === 'repositories'
  params.set('q', isRepositories ? composeQuery(query, filters) : query.trim())
  const sortParam = isRepositories ? SORT_PARAM[sort] : null
  if (sortParam) {
    params.set('sort', sortParam)
    params.set('order', 'desc')
  }
  params.set('per_page', String(perPage))
  params.set('page', String(page))
  return `/search/${type}?${params.toString()}`
}

function nonEmpty(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toRepository(raw: RawRepository): Repository {
  const spdx = raw.license?.spdx_id
  return {
    id: raw.id,
    owner: raw.owner.login,
    avatarUrl: raw.owner.avatar_url ?? null,
    name: raw.name,
    fullName: raw.full_name,
    htmlUrl: raw.html_url,
    description: raw.description ?? null,
    stars: raw.stargazers_count,
    language: raw.language ?? null,
    updatedAt: raw.updated_at,
    topics: raw.topics ?? [],
    license: spdx && spdx !== 'NOASSERTION' ? spdx : (raw.license?.name ?? null),
    pushedAt: raw.pushed_at,
    createdAt: raw.created_at,
    archived: raw.archived ?? false,
    isFork: raw.fork ?? false,
    isTemplate: raw.is_template ?? false,
    openIssues: raw.open_issues_count ?? 0,
    forks: raw.forks_count ?? 0,
    ownerType: raw.owner.type === 'Organization' ? 'Organization' : 'User',
    homepage: nonEmpty(raw.homepage),
    sizeKb: raw.size ?? 0,
  }
}

export async function searchRepositories(
  params: SearchParams,
  signal?: AbortSignal,
): Promise<Result<SearchResult>> {
  const result = await request<RawSearchResponse>(buildSearchPath(params), { signal })
  if (!result.ok) return result
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    // Raw payload as GitHub sent it, before toRepository() trims it. Dev builds only.
    console.log('[github] search/repositories raw response', params, result.data)
  }
  return {
    ok: true,
    data: {
      totalCount: result.data.total_count,
      incompleteResults: result.data.incomplete_results,
      items: result.data.items.map(toRepository),
    },
  }
}

/** One search of any type; the result carries its type for the UI. */
export async function search(
  req: SearchRequest,
  signal?: AbortSignal,
): Promise<Result<AnySearchResult>> {
  switch (req.type) {
    case 'repositories': {
      const result = await searchRepositories(req, signal)
      return result.ok ? { ok: true, data: { type: 'repositories', ...result.data } } : result
    }
    case 'users': {
      const result = await searchUsers(req, signal)
      return result.ok ? { ok: true, data: { type: 'users', ...result.data } } : result
    }
    case 'topics': {
      const result = await searchTopics(req, signal)
      return result.ok ? { ok: true, data: { type: 'topics', ...result.data } } : result
    }
  }
}
