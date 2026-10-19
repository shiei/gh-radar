import { useTranslation } from 'react-i18next'

import { RadarMark, Text } from '../../atoms'
import { LanguageSwitcher, ThemeToggle } from '../../molecules'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="border-border bg-surface border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Plain link to "/": clicking the brand reloads the app. Name hides on narrow screens. */}
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-md"
          aria-label={t('app.name')}
          data-testid="brand-link"
        >
          <RadarMark size={26} className="shrink-0" />
          <Text
            as="span"
            variant="heading"
            className="hidden min-[415px]:inline"
            data-testid="brand"
          >
            {t('app.name')}
          </Text>
        </a>
        <nav className="flex items-center gap-2" aria-label="Settings">
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
