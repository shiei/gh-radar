import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import type { Page, Request, Route } from '@playwright/test'

export type FixtureName = 'search-react' | 'search-small' | 'search-empty' | 'search-page100'

export function loadFixture(name: FixtureName): string {
  return readFileSync(fileURLToPath(new URL(`../fixtures/${name}.json`, import.meta.url)), 'utf8')
}

export interface MockOptions {
  status?: number
  headers?: Record<string, string>
  body?: string
}

const SEARCH_URL = 'https://api.github.com/search/repositories**'

/**
 * Answer every search request with the given fixture (or a custom status/body),
 * and collect the requests so tests can assert on URLs and headers.
 */
export async function mockSearch(
  page: Page,
  fixture: FixtureName | null,
  options: MockOptions = {},
): Promise<Request[]> {
  const requests: Request[] = []
  await page.route(SEARCH_URL, async (route: Route) => {
    requests.push(route.request())
    await route.fulfill({
      status: options.status ?? 200,
      contentType: 'application/json',
      headers: {
        'x-ratelimit-limit': '10',
        'x-ratelimit-remaining': '9',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60),
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After',
        ...options.headers,
      },
      body: options.body ?? (fixture ? loadFixture(fixture) : '{}'),
    })
  })
  return requests
}

/** Route search requests by page number so pagination tests can serve different fixtures. */
export async function mockSearchByPage(
  page: Page,
  byPage: Partial<Record<number, FixtureName>>,
  fallback: FixtureName,
): Promise<Request[]> {
  const requests: Request[] = []
  await page.route(SEARCH_URL, async (route: Route) => {
    requests.push(route.request())
    const url = new URL(route.request().url())
    const pageNumber = Number(url.searchParams.get('page') ?? '1')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: loadFixture(byPage[pageNumber] ?? fallback),
    })
  })
  return requests
}

export async function search(page: Page, query: string, via: 'enter' | 'button' = 'enter') {
  const input = page.getByTestId('search-input')
  await input.fill(query)
  if (via === 'enter') await input.press('Enter')
  else await page.getByTestId('search-submit').click()
}
