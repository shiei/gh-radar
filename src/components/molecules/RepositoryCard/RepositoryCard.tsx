import { useTranslation } from 'react-i18next'

import { cx } from '../../../lib/cx'
import { formatCompactNumber, formatDateTime, formatKb, formatTimestamp } from '../../../lib/format'
import { activityOf, type Activity, type Repository } from '../../../lib/github'
import { ExternalLinkIcon, StarIcon, Tag, TagButton, Text, Tooltip } from '../../atoms'

export interface RepositoryCardProps {
  repo: Repository
  /** Called with the topic name; the page turns it into a `topic:<name>` search. */
  onTopicClick?: (topic: string) => void
  /** Called with the language name; the page turns it into the language filter. */
  onLanguageClick?: (language: string) => void
}

const activityDot: Record<Activity, string> = {
  active: 'bg-success',
  quiet: 'bg-border-strong',
  inactive: 'bg-danger',
}

export function RepositoryCard({ repo, onTopicClick, onLanguageClick }: RepositoryCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  const activity = activityOf(repo.pushedAt)

  return (
    <li
      className={cx(
        'border-border bg-surface hover:border-border-strong flex flex-col gap-2 rounded-lg border p-4 transition-colors',
        repo.archived && 'opacity-60',
      )}
      data-testid="repo-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {/* Inline (not flex) so a very long owner or repo name can wrap instead of overflowing
              the card on narrow screens; the avatar sits inline before the text. */}
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent min-w-0 text-lg font-semibold [overflow-wrap:anywhere] break-words hover:underline"
            data-testid="repo-link"
          >
            {repo.avatarUrl ? (
              <img
                src={`${repo.avatarUrl}${repo.avatarUrl.includes('?') ? '&' : '?'}s=48`}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                className="bg-surface-muted mr-2 inline-block h-6 w-6 rounded-full align-text-bottom"
                data-testid="repo-avatar"
              />
            ) : null}
            <span className="text-text-muted">{repo.owner}</span>
            <span className="text-text-muted"> / </span>
            <span>{repo.name}</span>
          </a>
          {repo.archived ? (
            <Tag data-testid="repo-archived">{t('search.repo.archived')}</Tag>
          ) : null}
          {repo.isFork ? <Tag data-testid="repo-fork">{t('search.repo.fork')}</Tag> : null}
          {repo.isTemplate ? (
            <Tag data-testid="repo-template">{t('search.repo.template')}</Tag>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span
            className="text-text-muted inline-flex items-center gap-1"
            aria-label={t('search.repo.stars', { count: repo.stars })}
            data-testid="repo-stars"
          >
            <StarIcon size={14} />
            {formatCompactNumber(repo.stars, lang)}
          </span>
        </div>
      </div>

      {repo.description ? (
        <Text variant="body" className="text-sm" data-testid="repo-description">
          {repo.description}
        </Text>
      ) : null}

      {repo.topics.length > 0 ? (
        <ul className="flex flex-wrap gap-1" data-testid="repo-topics">
          {repo.topics.map((topic) => (
            <li key={topic}>
              {onTopicClick ? (
                <TagButton
                  onClick={() => onTopicClick(topic)}
                  aria-label={t('search.repo.searchTopic', { topic })}
                  data-testid="repo-topic"
                >
                  {topic}
                </TagButton>
              ) : (
                <Tag data-testid="repo-topic">{topic}</Tag>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <Tooltip content={t('search.repo.activityHint')}>
          <span
            className="inline-flex items-center gap-1"
            data-testid="repo-activity"
            data-activity={activity}
          >
            <span
              className={cx('h-2 w-2 rounded-full', activityDot[activity])}
              aria-hidden="true"
            />
            {t(`search.repo.activity.${activity}`)}
          </span>
        </Tooltip>
        <Tooltip content={`${t('search.repo.pushedHint')}\n${formatDateTime(repo.pushedAt, lang)}`}>
          <span data-testid="repo-pushed">
            {t('search.repo.pushed', { time: formatTimestamp(repo.pushedAt, lang) })}
          </span>
        </Tooltip>
        {repo.language ? (
          onLanguageClick ? (
            <button
              type="button"
              onClick={() => onLanguageClick(repo.language ?? '')}
              aria-label={t('search.filters.byLanguage', { language: repo.language })}
              className="hover:text-accent cursor-pointer hover:underline"
              data-testid="repo-language"
            >
              {repo.language}
            </button>
          ) : (
            <span data-testid="repo-language">{repo.language}</span>
          )
        ) : null}
        {repo.license ? (
          <span data-testid="repo-license">
            {t('search.repo.license')}: {repo.license}
          </span>
        ) : null}
        <span data-testid="repo-forks">
          {t('search.repo.forks', {
            count: repo.forks,
            formattedValue: formatCompactNumber(repo.forks, lang),
          })}
        </span>
        <span data-testid="repo-issues">{t('search.repo.issues', { count: repo.openIssues })}</span>
        <span data-testid="repo-size">
          {t('search.repo.size', { size: formatKb(repo.sizeKb, lang) })}
        </span>
        <span data-testid="repo-owner-type">{t(`search.repo.owner.${repo.ownerType}`)}</span>
        <Tooltip
          content={`${t('search.repo.updatedHint')}\n${formatDateTime(repo.updatedAt, lang)}`}
        >
          <span data-testid="repo-updated">
            {t('search.repo.updated', { time: formatTimestamp(repo.updatedAt, lang) })}
          </span>
        </Tooltip>
        {repo.homepage ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent inline-flex items-center gap-1 hover:underline"
            data-testid="repo-homepage"
          >
            {t('search.repo.homepage')}
            <ExternalLinkIcon size={11} />
          </a>
        ) : null}
      </div>
    </li>
  )
}
