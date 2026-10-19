export const GITHUB_API_BASE = 'https://api.github.com'
export const GITHUB_API_VERSION = '2022-11-28'

/**
 * Headers for every GitHub request. Unauthenticated for now: the token change
 * will add `Authorization` here and nowhere else.
 */
export function buildHeaders(): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  }
}
