export type PageRangeItem = number | 'gap'

/**
 * Pages to show: first, last, and a window around the current page.
 * Gaps are collapsed into 'gap'. Example for page 50 of 100: [1, gap, 48, 49, 50, 51, 52, gap, 100].
 */
export function pageRange(page: number, totalPages: number, siblings = 2): PageRangeItem[] {
  if (totalPages <= 1) return [1]
  const pages = new Set<number>([1, totalPages])
  for (let p = page - siblings; p <= page + siblings; p += 1) {
    if (p >= 1 && p <= totalPages) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)
  const out: PageRangeItem[] = []
  let previous = 0
  for (const p of sorted) {
    if (previous && p - previous === 2) out.push(previous + 1)
    else if (previous && p - previous > 2) out.push('gap')
    out.push(p)
    previous = p
  }
  return out
}
