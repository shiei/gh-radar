import { useTranslation } from 'react-i18next'

import { RadarMark, Text } from '../../atoms'
import { LanguageSwitcher, ThemeToggle, TokenMenu } from '../../molecules'
import { SettingsDrawer } from '../SettingsDrawer/SettingsDrawer'

export function Header() {
  const { t } = useTranslation()
  return (
    <header className="border-border bg-surface border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Plain link to "/": clicking the brand reloads the app. Name hides on narrow screens. */}
        <a
          href={import.meta.env.BASE_URL}
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
        {/* Inline controls from 650px up; a drawer below that. */}
        <nav className="hidden items-center gap-2 min-[650px]:flex" aria-label="Settings">
          <TokenMenu />
          <span
            aria-hidden="true"
            className="border-border-strong mx-1 h-4 border-l border-dashed"
          />
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>
        <div className="min-[650px]:hidden">
          <SettingsDrawer />
        </div>
      </div>
    </header>
  )
}
