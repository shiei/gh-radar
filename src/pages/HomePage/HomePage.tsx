import { useTranslation } from 'react-i18next'

import { Text } from '../../components/atoms'

export function HomePage() {
  const { t } = useTranslation()
  return (
    <section className="flex flex-col items-center gap-3 py-16 text-center">
      <Text as="h1" variant="title" data-testid="tagline">
        {t('app.tagline')}
      </Text>
      <Text variant="muted" data-testid="welcome">
        {t('home.welcome')}
      </Text>
    </section>
  )
}
