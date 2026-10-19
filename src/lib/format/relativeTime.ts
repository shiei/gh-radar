const DAY_SECONDS = 24 * 60 * 60
/** Dates older than this are shown as absolute dates, like GitHub does. */
export const RELATIVE_WINDOW_DAYS = 30

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * DAY_SECONDS],
  ['month', 30 * DAY_SECONDS],
  ['week', 7 * DAY_SECONDS],
  ['day', DAY_SECONDS],
  ['hour', 60 * 60],
  ['minute', 60],
]

/** "3 days ago" / "3 日前" / "3天前". Falls back to "now"-ish wording under a minute. */
export function formatRelativeTime(iso: string, lang: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()
  const diffSeconds = Math.round((then - now.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit)
    }
  }
  return rtf.format(0, 'second')
}

/** "Mar 4, 2025" / "2025年3月4日". */
export function formatDate(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(iso),
  )
}

/** Full timestamp to the minute, for tooltips: "Mar 4, 2025, 2:32 PM" / "2025年3月4日 14:32". */
export function formatDateTime(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

/**
 * GitHub-style hybrid: relative wording within the last 30 days ("3 days ago"),
 * an absolute date beyond that ("Mar 4, 2025").
 */
export function formatTimestamp(iso: string, lang: string, now: Date = new Date()): string {
  const ageDays = (now.getTime() - new Date(iso).getTime()) / (DAY_SECONDS * 1000)
  return ageDays <= RELATIVE_WINDOW_DAYS
    ? formatRelativeTime(iso, lang, now)
    : formatDate(iso, lang)
}
