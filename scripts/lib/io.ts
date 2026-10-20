import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { Latest, Meta, Series } from './transform'

export const DATA_DIR = path.resolve(process.cwd(), 'public/data')
export const WATCHLIST_FILE = path.resolve(process.cwd(), 'data/watchlist.txt')

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T
  } catch {
    return null
  }
}

export async function readWatchlist(): Promise<string[]> {
  try {
    const text = await readFile(WATCHLIST_FILE, 'utf8')
    return text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
  } catch {
    return []
  }
}

export async function readSeries(bucket: string): Promise<Series> {
  return (await readJson<Series>(path.join(DATA_DIR, 'series', `${bucket}.json`))) ?? {}
}

export async function listDailyDates(): Promise<string[]> {
  try {
    return (await readdir(path.join(DATA_DIR, 'daily')))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.slice(0, -5))
  } catch {
    return []
  }
}

export interface Output {
  latest: Latest
  series: Record<string, Series>
  meta: Meta
  pruneDates: string[]
}

export async function writeOutput(out: Output): Promise<void> {
  await mkdir(path.join(DATA_DIR, 'daily'), { recursive: true })
  await mkdir(path.join(DATA_DIR, 'series'), { recursive: true })
  await writeFile(path.join(DATA_DIR, 'latest.json'), JSON.stringify(out.latest))
  await writeFile(
    path.join(DATA_DIR, 'daily', `${out.latest.date}.json`),
    JSON.stringify(out.latest),
  )
  for (const [bucket, series] of Object.entries(out.series)) {
    await writeFile(path.join(DATA_DIR, 'series', `${bucket}.json`), JSON.stringify(series))
  }
  await writeFile(path.join(DATA_DIR, 'meta.json'), JSON.stringify(out.meta, null, 2) + '\n')
  for (const date of out.pruneDates)
    await rm(path.join(DATA_DIR, 'daily', `${date}.json`), { force: true })
}
