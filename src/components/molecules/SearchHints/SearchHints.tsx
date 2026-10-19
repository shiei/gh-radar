import { useTranslation } from 'react-i18next'

import { ExternalLinkIcon, TagButton } from '../../atoms'
import { SEARCH_EXAMPLES, SEARCH_SYNTAX_URL } from './examples'

export interface SearchHintsProps {
  onPick: (query: string) => void
}

/** Example queries that teach the qualifier syntax by doing. */
export function SearchHints({ onPick }: SearchHintsProps) {
  const { t } = useTranslation()
  return (
    <div
      className="text-text-muted flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
      data-testid="search-hints"
    >
      <span>{t('search.hints.label')}</span>
      {SEARCH_EXAMPLES.map((example) => (
        <TagButton
          key={example}
          onClick={() => onPick(example)}
          className="font-mono"
          data-testid="search-hint"
        >
          {example}
        </TagButton>
      ))}
      <a
        href={SEARCH_SYNTAX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent ml-auto inline-flex items-center gap-1 hover:underline"
        data-testid="search-syntax-link"
      >
        {t('search.hints.syntax')}
        <ExternalLinkIcon size={12} />
      </a>
    </div>
  )
}
