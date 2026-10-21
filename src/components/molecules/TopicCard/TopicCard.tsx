import { useTranslation } from 'react-i18next'

import type { TopicResult } from '../../../lib/github'
import { Tag, Text } from '../../atoms'

export interface TopicCardProps {
  topic: TopicResult
  /** Called with the topic name; the page turns it into a repository search. */
  onSelect: (name: string) => void
}

export function TopicCard({ topic, onSelect }: TopicCardProps) {
  const { t } = useTranslation()
  return (
    <li
      className="border-border bg-surface hover:border-border-strong flex flex-col gap-1.5 rounded-lg border p-4 transition-colors"
      data-testid="topic-card"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(topic.name)}
          aria-label={t('search.topic.search', { topic: topic.name })}
          className="text-accent cursor-pointer font-mono text-base font-semibold hover:underline"
          data-testid="topic-name"
        >
          {topic.name}
        </button>
        {topic.displayName && topic.displayName !== topic.name ? (
          <Text as="span" variant="muted" data-testid="topic-display-name">
            {topic.displayName}
          </Text>
        ) : null}
        {topic.featured ? (
          <Tag data-testid="topic-featured">{t('search.topic.featured')}</Tag>
        ) : null}
        {topic.curated ? <Tag data-testid="topic-curated">{t('search.topic.curated')}</Tag> : null}
      </div>
      {topic.shortDescription ? (
        <Text variant="body" className="text-sm" data-testid="topic-description">
          {topic.shortDescription}
        </Text>
      ) : null}
    </li>
  )
}
