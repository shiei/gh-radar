import { fail, ok, type Result } from './errors'
import { buildHeaders, GITHUB_API_BASE } from './headers'
import { setRateLimit, type RateLimit } from './rateLimit'

interface RateLimitResponse {
  resources?: { search?: { limit?: number; remaining?: number; reset?: number } }
}

/**
 * Check a candidate token against GET /rate_limit, which does not spend quota.
 * On success the search quota from the response becomes the current rate-limit state.
 */
export async function validateToken(
  token: string,
  signal?: AbortSignal,
): Promise<Result<RateLimit | null>> {
  let response: Response
  try {
    response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      method: 'GET',
      headers: buildHeaders(token),
      signal,
    })
  } catch (error) {
    const name = (error as { name?: unknown } | null)?.name
    return fail(name === 'AbortError' ? { kind: 'aborted' } : { kind: 'network' })
  }
  if (response.status === 401) return fail({ kind: 'invalid_token' })
  if (!response.ok) return fail({ kind: 'api', status: response.status })

  let body: RateLimitResponse
  try {
    body = (await response.json()) as RateLimitResponse
  } catch {
    body = {}
  }
  const search = body.resources?.search
  const state: RateLimit | null =
    search && typeof search.remaining === 'number' && typeof search.reset === 'number'
      ? {
          limit: typeof search.limit === 'number' ? search.limit : null,
          remaining: search.remaining,
          resetAt: new Date(search.reset * 1000),
        }
      : null
  if (state) setRateLimit(state)
  return ok(state)
}
