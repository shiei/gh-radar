import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { maxPage, type SearchState } from '../../../features/search'
import { formatNumber } from '../../../lib/format'
import { MAX_RESULTS } from '../../../lib/github'
import { InfoIcon, Text } from '../../atoms'
import { Pagination, RepositoryCard, StatusMessage, TopicCard, UserCard } from '../../molecules'

export interface SearchResultsProps {
  state: SearchState
  onPageChange: (page: number) => void
  onRetry: () => void
  /** A topic was clicked (on a repository card or a topic card). */
  onTopicClick: (topic: string) => void
  /** A language was clicked on a repository card. */
  onLanguageClick: (language: string) => void
}

export function SearchResults({
  state,
  onPageChange,
  onRetry,
  onTopicClick,
  onLanguageClick,
}: SearchResultsProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  const sectionRef = useRef<HTMLElement>(null)
  const lastPageRef = useRef(state.page)

  // Scroll to the top of the results after a page change (not on the initial search).
  useEffect(() => {
    if (state.page !== lastPageRef.current) {
      lastPageRef.current = state.page
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [state.page, state.requestId])

  if (state.status === 'idle') return null

  return (
    <section
      ref={sectionRef}
      className="flex flex-col gap-4"
      aria-live="polite"
      data-testid="search-results"
    >
      {state.status === 'loading' ? <StatusMessage status="loading" /> : null}
      {state.status === 'empty' ? <StatusMessage status="empty" type={state.type} /> : null}
      {state.status === 'error' && state.error ? (
        <StatusMessage status="error" error={state.error} onRetry={onRetry} />
      ) : null}
      {state.status === 'success' && state.result ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Text variant="muted" data-testid="result-count">
              {t(`search.count.${state.result.type}`, {
                total: formatNumber(state.result.totalCount, lang),
              })}
            </Text>
            {state.result.totalCount > MAX_RESULTS ? (
              <Text
                as="span"
                variant="muted"
                className="inline-flex items-center gap-1"
                data-testid="result-capped"
              >
                <InfoIcon size={14} className="text-text shrink-0" />
                {t('search.countCapped')}
              </Text>
            ) : null}
          </div>
          <ul className="flex flex-col gap-3" data-testid="result-list">
            {state.result.type === 'repositories'
              ? state.result.items.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repo={repo}
                    onTopicClick={onTopicClick}
                    onLanguageClick={onLanguageClick}
                  />
                ))
              : null}
            {state.result.type === 'users'
              ? state.result.items.map((user) => <UserCard key={user.id} user={user} />)
              : null}
            {state.result.type === 'topics'
              ? state.result.items.map((topic) => (
                  <TopicCard key={topic.name} topic={topic} onSelect={onTopicClick} />
                ))
              : null}
          </ul>
          <Pagination
            page={state.page}
            totalPages={maxPage(state.result.totalCount)}
            onPageChange={onPageChange}
          />
        </>
      ) : null}
    </section>
  )
}
