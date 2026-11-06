import { useTranslation } from 'react-i18next'

import { useConsent } from '../../../features/analytics'
import type { ConsentStore } from '../../../lib/analytics'
import { Button, Text } from '../../atoms'

export interface ConsentBannerProps {
  /** Overridable for tests; the app uses the shared store. */
  store?: ConsentStore
}

/**
 * Cookie notice shown until the visitor accepts or declines. Analytics is loaded only after
 * an explicit accept (see lib/analytics/install.ts); declining is one click, same as accepting.
 */
export function ConsentBanner({ store }: ConsentBannerProps) {
  const { t } = useTranslation()
  const { consent, grant, deny } = useConsent(store)
  if (consent !== null) return null
  return (
    <div
      role="region"
      aria-labelledby="consent-body"
      className="border-border bg-surface-raised fixed inset-x-0 bottom-0 z-30 border-t shadow-xl"
      data-testid="consent-banner"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-[30px] py-4 sm:flex-row sm:items-center sm:justify-between lg:px-4">
        <div className="flex flex-col gap-1">
          <Text id="consent-body" className="text-sm">
            {t('consent.body')}
          </Text>
          <details className="text-text-muted text-xs">
            <summary className="text-accent cursor-pointer hover:underline">
              {t('consent.more')}
            </summary>
            <p className="mt-1 max-w-prose">{t('consent.details')}</p>
          </details>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={deny} data-testid="consent-decline">
            {t('consent.decline')}
          </Button>
          <Button size="sm" onClick={grant} data-testid="consent-accept">
            {t('consent.accept')}
          </Button>
        </div>
      </div>
    </div>
  )
}
