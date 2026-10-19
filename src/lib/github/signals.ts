export type Activity = 'active' | 'quiet' | 'inactive'

const DAY = 24 * 60 * 60 * 1000

/** Active: pushed within 30 days. Quiet: within 180 days. Otherwise inactive. */
export function activityOf(pushedAt: string, now: Date = new Date()): Activity {
  const days = (now.getTime() - new Date(pushedAt).getTime()) / DAY
  if (days <= 30) return 'active'
  if (days <= 180) return 'quiet'
  return 'inactive'
}

/** Average stars gained per month since creation; the Rising Stars approximation. */
export function starsPerMonth(stars: number, createdAt: string, now: Date = new Date()): number {
  const months = Math.max((now.getTime() - new Date(createdAt).getTime()) / (30 * DAY), 1)
  return stars / months
}
