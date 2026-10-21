import type { Result } from './errors'
import { request } from './request'
import { PAGE_SIZE, type TopicResult } from './types'

interface RawTopic {
  name: string
  display_name?: string | null
  short_description?: string | null
  featured?: boolean
  curated?: boolean
}

interface RawTopicsResponse {
  total_count: number
  incomplete_results: boolean
  items: RawTopic[]
}

export interface TopicsSearchResult {
  totalCount: number
  incompleteResults: boolean
  items: TopicResult[]
}

function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return trimmed
}

export function toTopic(raw: RawTopic): TopicResult {
  return {
    name: raw.name,
    displayName: nonEmpty(raw.display_name),
    shortDescription: nonEmpty(raw.short_description),
    featured: raw.featured ?? false,
    curated: raw.curated ?? false,
  }
}

export function buildTopicsPath(query: string, page: number): string {
  const params = new URLSearchParams()
  params.set('q', query.trim())
  params.set('per_page', String(PAGE_SIZE))
  params.set('page', String(page))
  return `/search/topics?${params.toString()}`
}

/** GET /search/topics. Topics have no sort either. */
export async function searchTopics(
  { query, page }: { query: string; page: number },
  signal?: AbortSignal,
): Promise<Result<TopicsSearchResult>> {
  const result = await request<RawTopicsResponse>(buildTopicsPath(query, page), { signal })
  if (!result.ok) return result
  return {
    ok: true,
    data: {
      totalCount: result.data.total_count,
      incompleteResults: result.data.incomplete_results,
      items: result.data.items.map(toTopic),
    },
  }
}
