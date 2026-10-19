import { useTranslation } from 'react-i18next'

import { RadarMark, Text } from '../../atoms'
import { LanguageSwitcher, ThemeToggle } from '../../molecules'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="border-border bg-surface border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <span className="inline-flex items-center gap-2">
          <RadarMark size={26} className="shrink-0" />
          <Text as="span" variant="heading" data-testid="brand">
            {t('app.name')}
          </Text>
        </span>
        <nav className="flex items-center gap-2" aria-label="Settings">
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
