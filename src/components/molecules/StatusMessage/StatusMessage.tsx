import { useTranslation } from 'react-i18next'

import { formatTime } from '../../../lib/format'
import type { GitHubError, SearchType } from '../../../lib/github'
import { Button, RadarSpinner, Text } from '../../atoms'

export type StatusMessageProps =
  | { status: 'loading' }
  | { status: 'empty'; type?: SearchType }
  | { status: 'error'; error: GitHubError; onRetry: () => void }

function useErrorCopy(error: GitHubError): string {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  switch (error.kind) {
    case 'rate_limited': {
      const head = t('search.error.rateLimited')
      if (!error.resetAt) return head
      return `${head} ${t('search.error.rateLimitedUntil', { time: formatTime(error.resetAt, lang) })}`
    }
    case 'invalid_query':
      return t('search.error.invalidQuery')
    case 'network':
      return t('search.error.network')
    case 'api':
      return t('search.error.api', { status: error.status })
    case 'aborted':
      return t('search.error.network')
    case 'invalid_token':
      return t('token.invalid')
  }
}

function ErrorMessage({ error, onRetry }: { error: GitHubError; onRetry: () => void }) {
  const { t } = useTranslation()
  const copy = useErrorCopy(error)
  return (
    <div className="flex flex-col items-center gap-3" role="alert" data-testid="search-error">
      <Text variant="body" data-testid="search-error-text" data-error-kind={error.kind}>
        {copy}
      </Text>
      <Button variant="ghost" size="sm" onClick={onRetry} data-testid="search-retry">
        {t('search.error.retry')}
      </Button>
    </div>
  )
}

export function StatusMessage(props: StatusMessageProps) {
  const { t } = useTranslation()
  if (props.status === 'error') return <ErrorMessage error={props.error} onRetry={props.onRetry} />
  if (props.status === 'loading') {
    return (
      <div
        className="text-text-muted flex items-center justify-center gap-2 py-10"
        role="status"
        data-testid="search-loading"
      >
        <RadarSpinner size={22} className="text-accent" />
        <span>{t('search.state.loading')}</span>
      </div>
    )
  }
  return (
    <Text variant="muted" className="py-10 text-center" role="status" data-testid="search-empty">
      {t(`search.state.empty.${props.type ?? 'repositories'}`)}
    </Text>
  )
}
