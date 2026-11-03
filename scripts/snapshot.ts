/**
 * Daily snapshot of the repositories behind each discovery category.
 * Usage: GITHUB_TOKEN=... npm run snapshot [-- --dry-run] [--pages N] [--date YYYY-MM-DD]
 */
import { CATEGORIES, risingQuery } from '../src/lib/categories'
import { createClient } from './lib/fetchRepos'
import { listDailyDates, readSeries, readWatchlist, writeOutput } from './lib/io'
import {
  appendSeries,
  buildLatest,
  buildMeta,
  downsampleSeries,
  isoDate,
  mergeSources,
  pruneDaily,
  seriesBuckets,
  type Series,
  applyDeltas,
  historyDays,
  type SnapshotRecord,
  type SourceBatch,
} from './lib/transform'

const MAP_VERSION = 1

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const pages = Number(arg('--pages') ?? '3')
  const now = arg('--date') ? new Date(`${arg('--date') ?? ''}T00:00:00Z`) : new Date()
  const today = isoDate(now)
  const token = process.env.GITHUB_TOKEN
  const log = (m: string) => console.log(`[snapshot] ${m}`)
  if (!token) log('no GITHUB_TOKEN: running unauthenticated (10 searches/min, expect waits)')

  const client = createClient({ token, log })
  const batches: SourceBatch[] = []
  for (const category of CATEGORIES) {
    batches.push({
      source: `${category.id}:popular`,
      repos: await client.searchAll(category.query, pages),
    })
    batches.push({
      source: `${category.id}:rising`,
      repos: await client.searchAll(risingQuery(category, now), pages),
    })
  }
  const watchlist = await readWatchlist()
  const watched = []
  for (const name of watchlist) {
    const repo = await client.getRepo(name)
    if (repo) watched.push(repo)
    else log(`watchlist: ${name} not found, skipped`)
  }
  batches.push({ source: 'watchlist', repos: watched })

  const merged = buildLatest(mergeSources(batches), today)

  // Group today's records into series buckets, append, and downsample. Reads only: safe in dry run.
  const byBucket: Record<string, Record<string, SnapshotRecord>> = {}
  for (const [name, record] of Object.entries(merged.repos)) {
    for (const bucket of seriesBuckets(record.src)) (byBucket[bucket] ??= {})[name] = record
  }
  const series: Record<string, Series> = {}
  for (const [bucket, repos] of Object.entries(byBucket)) {
    series[bucket] = downsampleSeries(appendSeries(await readSeries(bucket), today, repos), today)
  }
  // Star deltas are precomputed here so the site only ever downloads latest.json and meta.json.
  const latest = applyDeltas(merged, series, today)
  const history = Math.max(0, ...Object.values(series).map(historyDays))
  const meta = buildMeta(latest, new Date(), MAP_VERSION, history)
  log(`total ${String(meta.total)} repositories, ${String(Math.round(history))} days of history`)
  for (const [source, count] of Object.entries(meta.sources)) log(`  ${source}: ${String(count)}`)

  if (dryRun) {
    log('dry run: nothing written')
    return
  }

  const pruneDates = pruneDaily(await listDailyDates(), today)
  await writeOutput({ latest, series, meta, pruneDates })
  log(`wrote public/data for ${today}; pruned ${String(pruneDates.length)} daily files`)
}

main().catch((error: unknown) => {
  console.error('[snapshot] failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
