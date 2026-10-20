import { getToken } from './token'

export const GITHUB_API_BASE = 'https://api.github.com'
export const GITHUB_API_VERSION = '2022-11-28'

/**
 * Headers for every GitHub request. `Authorization` is added only when the user
 * has saved a personal token; this is the single place that reads it.
 */
export function buildHeaders(token: string | null = getToken()): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}
