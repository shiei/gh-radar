import type { Result } from './errors'
import { request } from './request'
import {
  PAGE_SIZE,
  type Repository,
  type SearchParams,
  type SearchResult,
  type SearchSort,
} from './types'

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

export function buildSearchPath({ query, sort, page }: SearchParams): string {
  const params = new URLSearchParams()
  params.set('q', query.trim())
  const sortParam = SORT_PARAM[sort]
  if (sortParam) {
    params.set('sort', sortParam)
    params.set('order', 'desc')
  }
  params.set('per_page', String(PAGE_SIZE))
  params.set('page', String(page))
  return `/search/repositories?${params.toString()}`
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
