import { useTranslation } from 'react-i18next'

import { Text } from '../../atoms'
import { LanguageSwitcher, ThemeToggle } from '../../molecules'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="border-border bg-surface border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Text as="span" variant="heading" data-testid="brand">
          {t('app.name')}
        </Text>
        <nav className="flex items-center gap-2" aria-label="Settings">
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
