/**
 * Every way a GitHub API call can fail, as a discriminated union.
 * `request.ts` is the only producer; the UI switches on `kind`.
 */
export type GitHubError =
  | { kind: 'rate_limited'; resetAt: Date | null }
  | { kind: 'invalid_query' }
  | { kind: 'network' }
  | { kind: 'api'; status: number }
  | { kind: 'aborted' }
  | { kind: 'invalid_token' }

export type GitHubErrorKind = GitHubError['kind']

export type Result<T> = { ok: true; data: T } | { ok: false; error: GitHubError }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function fail<T>(error: GitHubError): Result<T> {
  return { ok: false, error }
}

export function isGitHubError(value: unknown): value is GitHubError {
  if (typeof value !== 'object' || value === null || !('kind' in value)) return false
  const { kind } = value
  return (
    kind === 'rate_limited' ||
    kind === 'invalid_query' ||
    kind === 'network' ||
    kind === 'api' ||
    kind === 'aborted' ||
    kind === 'invalid_token'
  )
}
