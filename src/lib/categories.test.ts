import { describe, expect, it } from 'vitest'

import { CATEGORIES, CATEGORY_IDS, getCategory, risingQuery } from './categories'

describe('categories', () => {
  it('defines exactly the six ids with non-empty queries', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([...CATEGORY_IDS])
    for (const c of CATEGORIES) expect(c.query).toMatch(/^topic:\S+ stars:>\d+$/)
  })

  it('builds the rising query from the topic, a lower star floor and a 90-day window', () => {
    const q = risingQuery(getCategory('devops'), new Date('2026-10-21T00:00:00Z'))
    expect(q).toBe('topic:devops stars:>20 created:>2026-07-23')
  })
})
