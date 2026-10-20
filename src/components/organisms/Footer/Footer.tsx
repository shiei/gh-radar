import { useTranslation } from 'react-i18next'

import { ExternalLinkIcon, Text } from '../../atoms'
import { ALTERNATIVES, PROJECT_URL } from './alternatives'

/** Renders "... <link>GitHub</link> ..." from the locale file with a real anchor in the middle. */
function AboutLine({ text }: { text: string }) {
  const [before = '', rest = ''] = text.split('<link>')
  const [label = '', after = ''] = rest.split('</link>')
  return (
    <>
      {before}
      <a
        href={PROJECT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent inline-flex items-center gap-0.5 hover:underline"
        data-testid="footer-project"
      >
        {label}
        <ExternalLinkIcon size={10} />
      </a>
      {after}
    </>
  )
}

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-border bg-surface border-t" data-testid="footer">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-[30px] py-10 lg:px-4">
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
        <Text variant="muted" className="text-center text-xs" data-testid="footer-about">
          <AboutLine text={t('footer.about')} />
        </Text>
      </div>
    </footer>
  )
}
