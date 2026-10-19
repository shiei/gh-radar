import { useTranslation } from 'react-i18next'

import { cx } from '../../../lib/cx'
import { formatCompactNumber, formatKb, formatRelativeTime } from '../../../lib/format'
import { activityOf, type Activity, type Repository } from '../../../lib/github'
import { StarIcon, Tag, Text } from '../../atoms'

export interface RepositoryCardProps {
  repo: Repository
}

const activityDot: Record<Activity, string> = {
  active: 'bg-success',
  quiet: 'bg-border-strong',
  inactive: 'bg-danger',
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  const activity = activityOf(repo.pushedAt)

  return (
    <li
      className={cx(
        'border-border flex flex-col gap-2 border-b py-4 last:border-b-0',
        repo.archived && 'opacity-60',
      )}
      data-testid="repo-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent inline-flex items-center gap-2 text-lg font-semibold hover:underline"
            data-testid="repo-link"
          >
            {repo.avatarUrl ? (
              <img
                src={`${repo.avatarUrl}${repo.avatarUrl.includes('?') ? '&' : '?'}s=48`}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                className="bg-surface-muted h-6 w-6 shrink-0 rounded-full"
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
              <Tag>{topic}</Tag>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span
          className="inline-flex items-center gap-1"
          data-testid="repo-activity"
          data-activity={activity}
        >
          <span className={cx('h-2 w-2 rounded-full', activityDot[activity])} aria-hidden="true" />
          {t(`search.repo.activity.${activity}`)}
        </span>
        <span data-testid="repo-pushed">
          {t('search.repo.pushed', { time: formatRelativeTime(repo.pushedAt, lang) })}
        </span>
        {repo.language ? <span data-testid="repo-language">{repo.language}</span> : null}
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
        {repo.homepage ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
            data-testid="repo-homepage"
          >
            {t('search.repo.homepage')}
          </a>
        ) : null}
        <span data-testid="repo-updated">
          {t('search.repo.updated', { time: formatRelativeTime(repo.updatedAt, lang) })}
        </span>
      </div>
    </li>
  )
}
