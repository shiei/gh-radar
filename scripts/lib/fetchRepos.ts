import type { RawRepo } from './transform'

export interface ClientOptions {
  token?: string
  fetchImpl?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  log?: (message: string) => void
  maxRetries?: number
}

export class SnapshotFetchError extends Error {
  readonly status: number | undefined
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'SnapshotFetchError'
    this.status = status
  }
}

const API = 'https://api.github.com'

/** Sequential GitHub client with quota waiting and bounded retries. */
export function createClient(options: ClientOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const now = options.now ?? (() => Date.now())
  const log = options.log ?? ((): void => undefined)
  const maxRetries = options.maxRetries ?? 3

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'opensource-radar-snapshot',
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`

  async function waitForQuota(response: Response) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    if (remaining === '0' && reset) {
      const ms = Math.max(0, Number(reset) * 1000 - now()) + 1000
      log(`quota exhausted, waiting ${String(Math.ceil(ms / 1000))}s`)
      await sleep(ms)
    }
  }

  async function get(path: string): Promise<{ status: number; json: unknown }> {
    for (let attempt = 0; ; attempt += 1) {
      let response: Response
      try {
        response = await fetchImpl(`${API}${path}`, { headers })
      } catch (error) {
        if (attempt >= maxRetries)
          throw new SnapshotFetchError(`network error on ${path}: ${String(error)}`)
        await sleep(2 ** attempt * 1000)
        continue
      }
      if (response.status === 403 || response.status === 429) {
        const retryAfter = response.headers.get('retry-after')
        if (retryAfter) await sleep(Number(retryAfter) * 1000)
        else await waitForQuota(response)
        if (attempt >= maxRetries)
          throw new SnapshotFetchError(`rate limited on ${path}`, response.status)
        continue
      }
      if (response.status >= 500) {
        if (attempt >= maxRetries)
          throw new SnapshotFetchError(
            `server error ${String(response.status)} on ${path}`,
            response.status,
          )
        await sleep(2 ** attempt * 1000)
        continue
      }
      const json: unknown = response.status === 204 ? null : await response.json()
      await waitForQuota(response)
      return { status: response.status, json }
    }
  }

  /** Up to `pages` pages of a repository search, sorted by stars. 422 means the 1000-result window ended. */
  async function searchAll(query: string, pages = 3, perPage = 100): Promise<RawRepo[]> {
    const out: RawRepo[] = []
    for (let page = 1; page <= pages; page += 1) {
      const params = new URLSearchParams({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: String(perPage),
        page: String(page),
      })
      const { status, json } = await get(`/search/repositories?${params.toString()}`)
      if (status === 422) break
      if (status !== 200)
        throw new SnapshotFetchError(`unexpected ${String(status)} for search "${query}"`, status)
      const items = (json as { items?: RawRepo[] }).items ?? []
      out.push(...items)
      log(`search "${query}" page ${String(page)}: ${String(items.length)} items`)
      if (items.length < perPage) break
    }
    return out
  }

  async function getRepo(fullName: string): Promise<RawRepo | null> {
    const { status, json } = await get(`/repos/${fullName}`)
    if (status === 404) return null
    if (status !== 200)
      throw new SnapshotFetchError(`unexpected ${String(status)} for repo ${fullName}`, status)
    return json as RawRepo
  }

  return { searchAll, getRepo }
}
