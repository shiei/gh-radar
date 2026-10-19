const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
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
