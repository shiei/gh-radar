import { useTranslation } from 'react-i18next'

import { useRepositorySearch } from '../../features/search'
import { useTheme, type Theme } from '../../lib/theme'
import { Text } from '../../components/atoms'
import { SearchBar } from '../../components/molecules'
import { SearchResults } from '../../components/organisms'

// Browsers reuse a cached <img> SVG together with its finished SMIL timeline, so a plain
// reload would show the radar already stopped. A per-page-load query makes it a fresh image.
// One file per theme: an <img> cannot see our data-theme attribute.
const CACHE_BUST = `?v=${String(Date.now())}`
const RADAR_SRC: Record<Theme, string> = {
  dark: `/radar-dark.svg${CACHE_BUST}`,
  light: `/radar-light.svg${CACHE_BUST}`,
}

export function HomePage() {
  const { t } = useTranslation()
  const { state, submit, setSort, goToPage, retry } = useRepositorySearch()
  const { theme } = useTheme()

  return (
    <div className="flex flex-col gap-8">
      <section className="relative flex min-h-56 flex-col items-center justify-center gap-3 overflow-hidden text-center md:min-h-80">
        <img
          src={RADAR_SRC[theme]}
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
      <SearchBar
        query={state.query}
        sort={state.sort}
        loading={state.status === 'loading'}
        onSubmit={submit}
        onSortChange={setSort}
      />
      <SearchResults state={state} onPageChange={goToPage} onRetry={retry} onSearch={submit} />
    </div>
  )
}
