import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cx } from '../../../lib/cx'
import { formatNumber } from '../../../lib/format'
import {
  DEFAULT_FILTERS,
  MIN_STARS_OPTIONS,
  type MinStars,
  type SearchFilters as Filters,
} from '../../../lib/github'
import { LANGUAGES } from '../../../lib/languages'
import {
  Button,
  ChevronDownIcon,
  InfoIcon,
  SelectField,
  SwitchField,
  Text,
  Tooltip,
} from '../../atoms'
import { activeFilterCount } from './activeFilterCount'

export interface SearchFiltersProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  /** `panel` lives in the wide-screen sidebar; `collapsible` folds under the search box. */
  variant: 'panel' | 'collapsible'
}

const ANY = ''

function Controls({ filters, onChange }: Pick<SearchFiltersProps, 'filters' | 'onChange'>) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  // A language picked from a card may not be in the fixed list; keep it selectable.
  const languages =
    filters.language && !LANGUAGES.includes(filters.language)
      ? [...LANGUAGES, filters.language]
      : LANGUAGES
  const languageOptions = [
    { value: ANY, label: t('search.filters.anyLanguage') },
    ...languages.map((l) => ({ value: l, label: l })),
  ]
  const starOptions = MIN_STARS_OPTIONS.map((n) => ({
    value: String(n),
    label:
      n === 0
        ? t('search.filters.anyStars')
        : t('search.filters.starsAtLeast', { value: formatNumber(n, lang) }),
  }))
  const active = activeFilterCount(filters)

  return (
    <div className="flex flex-col gap-3" data-testid="search-filters">
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">{t('search.filters.language')}</span>
        <SelectField
          size="sm"
          label={t('search.filters.language')}
          value={filters.language ?? ANY}
          options={languageOptions}
          onChange={(value) => onChange({ language: value === ANY ? null : value })}
          data-testid="filter-language"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-text-muted">{t('search.filters.minStars')}</span>
        <SelectField
          size="sm"
          label={t('search.filters.minStars')}
          value={String(filters.minStars)}
          options={starOptions}
          onChange={(value) => onChange({ minStars: Number(value) as MinStars })}
          data-testid="filter-min-stars"
        />
      </label>
      <SwitchField
        label={t('search.filters.excludeForks')}
        checked={filters.excludeForks}
        onCheckedChange={(checked) => onChange({ excludeForks: checked })}
        data-testid="filter-exclude-forks"
      />
      <SwitchField
        label={t('search.filters.excludeArchived')}
        checked={filters.excludeArchived}
        onCheckedChange={(checked) => onChange({ excludeArchived: checked })}
        data-testid="filter-exclude-archived"
      />
      {active > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => onChange(DEFAULT_FILTERS)}
          data-testid="filter-clear"
        >
          {t('search.filters.clear')}
        </Button>
      ) : null}
    </div>
  )
}

export function SearchFilters({ filters, onChange, variant }: SearchFiltersProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const active = activeFilterCount(filters)

  const hint = (
    <Tooltip content={t('search.filters.hint')}>
      <span className="text-text-muted inline-flex" data-testid="search-filters-hint">
        <InfoIcon size={14} />
      </span>
    </Tooltip>
  )
  const box = (
    <div className="border-border bg-surface rounded-md border p-3">
      <Controls filters={filters} onChange={onChange} />
    </div>
  )

  if (variant === 'panel') {
    return (
      <section aria-label={t('search.filters.title')} data-testid="search-filters-panel">
        <div className="mb-2 flex items-center gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            {t('search.filters.title')}
            {active > 0 ? (
              <span className="text-accent ml-1 normal-case" data-testid="search-filters-active">
                ({active})
              </span>
            ) : null}
          </Text>
          {hint}
        </div>
        {box}
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-2" data-testid="search-filters-collapsible">
      <div className="flex items-center gap-1.5 self-start">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="text-text-muted hover:text-text inline-flex items-center gap-1 text-xs transition-colors"
          data-testid="search-filters-toggle"
        >
          {t('search.filters.toggle')}
          {active > 0 ? (
            <span className="text-accent" data-testid="search-filters-active">
              ({t('search.filters.activeCount', { count: active })})
            </span>
          ) : null}
          <ChevronDownIcon
            size={12}
            className={cx('transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
        {hint}
      </div>
      {open ? box : null}
    </div>
  )
}
