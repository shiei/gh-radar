import { useTranslation } from 'react-i18next'

import { ExternalLinkIcon, RadarMark, Text } from '../../atoms'
import { ALTERNATIVES, PROJECT_URL } from './alternatives'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-border bg-surface border-t" data-testid="footer">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-[30px] py-10 lg:flex-row lg:justify-between lg:px-4">
        <section className="flex flex-col gap-3" aria-labelledby="footer-alternatives">
          <Text
            as="h2"
            id="footer-alternatives"
            variant="muted"
            className="text-xs font-semibold tracking-wide uppercase"
          >
            {t('footer.alternatives')}
          </Text>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {ALTERNATIVES.map((alt) => (
              <li key={alt.id} className="text-sm" data-testid="footer-alternative">
                <a
                  href={alt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent inline-flex items-center gap-1 font-medium hover:underline"
                >
                  {alt.name}
                  <ExternalLinkIcon size={11} />
                </a>
                <span className="text-text-muted block text-xs">{t(`footer.links.${alt.id}`)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2 lg:max-w-xs lg:items-end lg:text-right">
          <span className="inline-flex items-center gap-2">
            <RadarMark size={20} />
            <Text as="span" variant="heading" className="text-sm">
              {t('app.name')}
            </Text>
          </span>
          <Text variant="muted" className="text-xs">
            {t('footer.tagline')}
          </Text>
          <a
            href={PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent inline-flex items-center gap-1 text-xs hover:underline"
            data-testid="footer-project"
          >
            {t('footer.project')}
            <ExternalLinkIcon size={11} />
          </a>
        </section>
      </div>
    </footer>
  )
}
