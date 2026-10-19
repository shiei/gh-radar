import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { SearchSort } from '../../../lib/github'
import { ArrowRightIcon, Input, RadarSpinner, SearchIcon, SelectField } from '../../atoms'

export interface SearchBarProps {
  sort: SearchSort
  loading: boolean
  onSubmit: (query: string) => void
  onSortChange: (sort: SearchSort) => void
}

const SORTS: readonly SearchSort[] = ['best', 'stars', 'updated']

/**
 * No standalone button: Enter (or the soft keyboard's "search" key) submits, and a
 * small arrow inside the field is the visible affordance. While loading the arrow
 * becomes a spinner, but submitting stays possible so a newer search replaces the
 * one in flight.
 */
export function SearchBar({ sort, loading, onSubmit, onSortChange }: SearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = value.trim()
    if (!query) return
    onSubmit(query)
  }

  const options = SORTS.map((s) => ({ value: s, label: t(`search.sort.${s}`) }))

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <SearchIcon
          size={18}
          className="text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <Input
          type="search"
          enterKeyHint="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          autoComplete="off"
          className="pr-11 pl-10"
          data-testid="search-input"
        />
        <button
          type="submit"
          aria-label={t('search.submit')}
          aria-busy={loading}
          className="text-text-muted hover:bg-surface-muted hover:text-text absolute top-1/2 right-1.5 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
          data-testid="search-submit"
        >
          {loading ? (
            <RadarSpinner size={18} className="text-accent" />
          ) : (
            <ArrowRightIcon size={18} />
          )}
        </button>
      </div>
      <SelectField
        label={t('search.sort.label')}
        value={sort}
        options={options}
        onChange={onSortChange}
        data-testid="search-sort"
      />
    </form>
  )
}
