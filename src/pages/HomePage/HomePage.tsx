import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '../../components/atoms'
import { CategoryNav, RankingList, SearchBar, SearchHints } from '../../components/molecules'
import { SearchResults } from '../../components/organisms'
import { DiscoveryLayout } from '../../components/templates'
import { useSnapshot } from '../../features/rankings'
import { useRepositorySearch } from '../../features/search'
import { CATEGORIES, type CategoryId } from '../../lib/categories'
import { cx } from '../../lib/cx'
import { formatNumber } from '../../lib/format'
import { rankPopular, rankRising } from '../../lib/rankings'
import { decodeLatest } from '../../lib/snapshot'
import { useTheme, type Theme } from '../../lib/theme'

// Browsers cache an <img> SVG together with its finished SMIL timeline, so reusing a URL shows
// the radar already stopped. A fresh query string per page load and per theme switch makes it a
// new image, so the sweep plays on first paint and again whenever the theme changes.
// One file per theme: an <img> cannot see our data-theme attribute.
const PAGE_LOAD = Date.now()
function radarSrc(theme: Theme, generation: number): string {
  return `${import.meta.env.BASE_URL}radar-${theme}.svg?v=${String(PAGE_LOAD)}-${String(generation)}`
}

function RankingsPanel({ activeCategory }: { activeCategory: CategoryId | null }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  const snapshot = useSnapshot()
  const repos = useMemo(
    () => (snapshot.status === 'ready' ? decodeLatest(snapshot.bundle.latest) : []),
    [snapshot],
  )
  const popular = useMemo(() => rankPopular(repos, activeCategory), [repos, activeCategory])
  const rising = useMemo(
    () =>
      snapshot.status === 'ready'
        ? rankRising(repos, snapshot.bundle.series, new Date(), activeCategory)
        : { mode: 'fallback' as const, items: [] },
    [repos, snapshot, activeCategory],
  )

  if (snapshot.status === 'loading') {
    return (
      <Text variant="muted" className="text-xs" data-testid="rankings-loading">
        {t('ranking.loading')}
      </Text>
    )
  }
  if (snapshot.status === 'missing') {
    return (
      <Text variant="muted" className="text-xs" data-testid="rankings-missing">
        {t('ranking.missing')}
      </Text>
    )
  }
  if (snapshot.status === 'error') {
    return (
      <div className="flex flex-col gap-2" data-testid="rankings-error">
        <Text variant="muted" className="text-xs">
          {t('ranking.error')}
        </Text>
        <button
          type="button"
          className="text-accent self-start text-xs hover:underline"
          onClick={snapshot.reload}
        >
          {t('ranking.retry')}
        </button>
      </div>
    )
  }
  // CJK sentences butt together; Latin ones need a space between them.
  const sentenceGap = lang === 'ja' || lang === 'zh' ? '' : ' '
  // Denominator first, so "Most Popular" is not mistaken for a GitHub-wide ranking.
  const scope = [
    t('ranking.scope', { total: formatNumber(snapshot.bundle.meta.total, lang) }),
    activeCategory ? t('ranking.scopeCategory', { category: t(`category.${activeCategory}`) }) : '',
  ]
    .filter(Boolean)
    .join(sentenceGap)
  return (
    <div className="flex flex-col gap-6" data-testid="rankings">
      <RankingList
        id="popular"
        title={t('ranking.popular')}
        hint={`${scope}${sentenceGap}${t('ranking.popularHint')}`}
        items={popular}
      />
      <RankingList
        id="rising"
        title={t('ranking.rising')}
        hint={`${scope}${sentenceGap}${t('ranking.risingHint')}`}
        items={rising.items}
        fallback={rising.mode === 'fallback'}
      />
      <Text variant="muted" className="text-xs" data-testid="rankings-date">
        {t('ranking.dataDate', { date: snapshot.bundle.meta.date })}
        {snapshot.stale ? ` · ${t('ranking.stale', { days: snapshot.ageDays })}` : ''}
      </Text>
    </div>
  )
}

export function HomePage() {
  const { t } = useTranslation()
  const { state, submit, setSort, goToPage, retry } = useRepositorySearch()
  const { theme } = useTheme()
  // Bumps on every theme change so the radar reloads and replays (see radarSrc).
  const [generation, setGeneration] = useState(0)
  const [seenTheme, setSeenTheme] = useState(theme)
  if (theme !== seenTheme) {
    setSeenTheme(theme)
    setGeneration((g) => g + 1)
  }
  const activeCategory = CATEGORIES.find((c) => c.query === state.query)?.id ?? null

  const hero = (
    <section className="relative flex min-h-56 flex-col items-center justify-center gap-3 overflow-hidden text-center md:min-h-80">
      <img
        src={radarSrc(theme, generation)}
        alt=""
        aria-hidden="true"
        width={400}
        height={400}
        className="hero-radar pointer-events-none absolute top-[44%] left-0 hidden h-[26rem] w-[26rem] -translate-x-[8%] -translate-y-1/2 opacity-90 select-none min-[998px]:block"
        data-testid="hero-radar"
      />
      <div className="relative flex flex-col items-center gap-3 px-[30px]">
        <Text as="h1" variant="title" className="text-halo" data-testid="tagline">
          {t('app.tagline')}
        </Text>
        <Text variant="lead" className="text-halo" data-testid="welcome">
          {t('home.welcome')}
        </Text>
      </div>
    </section>
  )

  const searchBlock = (
    <div className="flex flex-col gap-2">
      <SearchBar
        query={state.query}
        sort={state.sort}
        loading={state.status === 'loading'}
        onSubmit={submit}
        onSortChange={setSort}
      />
      <SearchHints onPick={submit} />
      {/* Below lg the rankings sit under the search block, so the rule is always needed there;
          from lg up the column is empty while idle, so hide it until there are results. */}
      <hr
        className={cx(
          'border-border mx-auto mt-[19px] w-[98%] border-0 border-t',
          state.status === 'idle' && 'lg:hidden',
        )}
        data-testid="search-rule"
      />
    </div>
  )

  return (
    <DiscoveryLayout
      hero={hero}
      sidebar={
        <CategoryNav variant="list" activeQuery={state.query} onSelect={(c) => submit(c.query)} />
      }
      chips={
        <CategoryNav variant="chips" activeQuery={state.query} onSelect={(c) => submit(c.query)} />
      }
      main={
        <>
          {searchBlock}
          <SearchResults state={state} onPageChange={goToPage} onRetry={retry} onSearch={submit} />
        </>
      }
      aside={<RankingsPanel activeCategory={activeCategory} />}
      showAsideBelow={state.status === 'idle'}
    />
  )
}
