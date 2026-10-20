import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import type { Page } from '@playwright/test'

function fixture(rel: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../fixtures/snapshot/${rel}`, import.meta.url)),
    'utf8',
  )
}

/** Serve the fixture snapshot (30 repos, 14-day series dated 2026-10-20) instead of public/data. */
export async function mockSnapshot(page: Page, options: { missing?: boolean } = {}) {
  await page.route('**/data/**', async (route) => {
    if (options.missing) return route.fulfill({ status: 404, body: '{}' })
    const path = new URL(route.request().url()).pathname.replace(/^.*\/data\//, '')
    try {
      await route.fulfill({ status: 200, contentType: 'application/json', body: fixture(path) })
    } catch {
      await route.fulfill({ status: 404, body: '{}' })
    }
  })
}

/** Freeze the browser clock so the fixture's 14 days count as fresh history. */
export async function freezeDate(page: Page, iso = '2026-10-21T09:00:00Z') {
  await page.clock.setFixedTime(new Date(iso))
}
