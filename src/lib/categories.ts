/**
 * The six discovery categories. Shared by the site (navigation) and by
 * scripts/snapshot.ts (which repositories get snapshotted), so keep it free of
 * React and browser APIs.
 */
export const CATEGORY_IDS = [
  'frontend',
  'backend',
  'ai-ml',
  'devops',
  'database',
  'design',
] as const
export type CategoryId = (typeof CATEGORY_IDS)[number]

export interface Category {
  id: CategoryId
  /** GitHub repository search query for the category's "popular" list. */
  query: string
}

export const CATEGORIES: readonly Category[] = [
  { id: 'frontend', query: 'topic:frontend stars:>200' },
  { id: 'backend', query: 'topic:backend stars:>200' },
  { id: 'ai-ml', query: 'topic:machine-learning stars:>200' },
  { id: 'devops', query: 'topic:devops stars:>200' },
  { id: 'database', query: 'topic:database stars:>200' },
  { id: 'design', query: 'topic:design-system stars:>100' },
]

export function getCategory(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown category: ${id}`)
  return found
}

export const RISING_WINDOW_DAYS = 90
/** Young repositories rarely clear the category star floor; rising uses a lower one. */
export const RISING_MIN_STARS = 20

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** The category's topic, restricted to repositories created in the last 90 days with a lower star floor. */
export function risingQuery(category: Category, now: Date): string {
  const since = new Date(now.getTime() - RISING_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const topic = category.query.replace(/\s*stars:>\d+/, '')
  return `${topic} stars:>${String(RISING_MIN_STARS)} created:>${isoDate(since)}`
}
