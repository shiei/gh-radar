import type { SearchFilters } from '../../../lib/github'

/** How many filters differ from their default. */
export function activeFilterCount(filters: SearchFilters): number {
  return [
    filters.language !== null,
    filters.minStars > 0,
    filters.excludeForks,
    filters.excludeArchived,
  ].filter(Boolean).length
}
