import { useTranslation } from 'react-i18next'

import type { TypeCounts } from '../../../features/search'
import { cx } from '../../../lib/cx'
import { formatCompactNumber } from '../../../lib/format'
import { SEARCH_TYPES, type SearchType } from '../../../lib/github'

export interface SearchTypeTabsProps {
  value: SearchType
  /** Match counts for the other types; only present when a token makes them affordable. */
  counts: TypeCounts
  onChange: (type: SearchType) => void
}

const tabBase =
  'inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-sm transition-colors focus-visible:outline-2'
const tabIdle = 'text-text-muted hover:bg-surface-muted hover:text-text'
const tabActive = 'bg-accent text-accent-text'

/** Segmented control for what the search looks for. */
export function SearchTypeTabs({ value, counts, onChange }: SearchTypeTabsProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  return (
    <div
      role="group"
      aria-label={t('search.type.label')}
      className="border-border bg-surface inline-flex self-start rounded-md border p-0.5"
      data-testid="search-types"
    >
      {SEARCH_TYPES.map((type) => {
        const active = type === value
        const count = active ? undefined : counts[type]
        return (
          <button
            key={type}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(type)}
            className={cx(tabBase, active ? tabActive : tabIdle)}
            data-testid="search-type"
            data-type={type}
          >
            {t(`search.type.${type}`)}
            {count !== undefined ? (
              <span
                className={cx('text-xs tabular-nums', active ? 'opacity-80' : 'text-text-muted')}
                data-testid="search-type-count"
              >
                {formatCompactNumber(count, lang)}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
