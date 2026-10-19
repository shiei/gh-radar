import { fail, ok, type GitHubError, type Result } from './errors'
import { buildHeaders, GITHUB_API_BASE } from './headers'
import { parseRateLimit, setRateLimit } from './rateLimit'

export interface RequestOptions {
  signal?: AbortSignal
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'AbortError'
  )
}

/** Reset time for a rate-limited response: Retry-After (seconds) wins over X-RateLimit-Reset. */
function resolveResetAt(headers: Headers, now: number): Date | null {
  const retryAfter = headers.get('retry-after')
  if (retryAfter !== null) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return new Date(now + seconds * 1000)
  }
  const reset = headers.get('x-ratelimit-reset')
  if (reset !== null) {
    const epoch = Number(reset)
    if (Number.isFinite(epoch)) return new Date(epoch * 1000)
  }
  return null
}

function classify(response: Response): GitHubError {
  const { status, headers } = response
  if (status === 429) {
    return { kind: 'rate_limited', resetAt: resolveResetAt(headers, Date.now()) }
  }
  if (status === 403) {
    const exhausted = headers.get('x-ratelimit-remaining') === '0' || headers.has('retry-after')
    if (exhausted) return { kind: 'rate_limited', resetAt: resolveResetAt(headers, Date.now()) }
    return { kind: 'api', status }
  }
  if (status === 422) return { kind: 'invalid_query' }
  return { kind: 'api', status }
}

/**
 * GET a GitHub REST path and decode JSON. Never throws: every outcome is a Result.
 * Rate-limit headers are recorded for every response that arrives, success or not.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<Result<T>> {
  let response: Response
  try {
    response = await fetch(`${GITHUB_API_BASE}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
      signal: options.signal,
    })
  } catch (error) {
    if (isAbortError(error)) return fail({ kind: 'aborted' })
    return fail({ kind: 'network' })
  }

  setRateLimit(parseRateLimit(response.headers))

  if (!response.ok) return fail(classify(response))

  try {
    return ok((await response.json()) as T)
  } catch {
    return fail({ kind: 'api', status: response.status })
  }
}
