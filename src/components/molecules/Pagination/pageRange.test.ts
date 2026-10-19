import { describe, expect, it } from 'vitest'

import { pageRange } from './pageRange'

describe('pageRange', () => {
  it('lists every page when there are few', () => {
    expect(pageRange(1, 1)).toEqual([1])
    expect(pageRange(1, 2)).toEqual([1, 2])
    expect(pageRange(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('collapses far pages into gaps around the current page', () => {
    expect(pageRange(50, 100)).toEqual([1, 'gap', 48, 49, 50, 51, 52, 'gap', 100])
    expect(pageRange(1, 100)).toEqual([1, 2, 3, 'gap', 100])
    expect(pageRange(100, 100)).toEqual([1, 'gap', 98, 99, 100])
  })

  it('never emits a gap for a single missing page', () => {
    expect(pageRange(4, 100)).toEqual([1, 2, 3, 4, 5, 6, 'gap', 100])
    expect(pageRange(5, 100)).toEqual([1, 2, 3, 4, 5, 6, 7, 'gap', 100])
  })
})
