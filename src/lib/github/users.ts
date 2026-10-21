import type { Result } from './errors'
import { request } from './request'
import { PAGE_SIZE, type UserResult } from './types'

interface RawUser {
  id: number
  login: string
  avatar_url?: string
  html_url: string
  type?: string
}

interface RawUsersResponse {
  total_count: number
  incomplete_results: boolean
  items: RawUser[]
}

export interface UsersSearchResult {
  totalCount: number
  incompleteResults: boolean
  items: UserResult[]
}

export function toUser(raw: RawUser): UserResult {
  return {
    id: raw.id,
    login: raw.login,
    avatarUrl: raw.avatar_url ?? null,
    htmlUrl: raw.html_url,
    kind: raw.type === 'Organization' ? 'Organization' : 'User',
  }
}

export function buildUsersPath(query: string, page: number): string {
  const params = new URLSearchParams()
  params.set('q', query.trim())
  params.set('per_page', String(PAGE_SIZE))
  params.set('page', String(page))
  return `/search/users?${params.toString()}`
}

/** GET /search/users. No sort: GitHub's best match only. */
export async function searchUsers(
  { query, page }: { query: string; page: number },
  signal?: AbortSignal,
): Promise<Result<UsersSearchResult>> {
  const result = await request<RawUsersResponse>(buildUsersPath(query, page), { signal })
  if (!result.ok) return result
  return {
    ok: true,
    data: {
      totalCount: result.data.total_count,
      incompleteResults: result.data.incomplete_results,
      items: result.data.items.map(toUser),
    },
  }
}
