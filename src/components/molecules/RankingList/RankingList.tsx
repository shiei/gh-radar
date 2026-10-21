import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatCompactNumber } from '../../../lib/format'
import { RANKING_TOP, type RankedRepo } from '../../../lib/rankings'
import { avatarUrl } from '../../../lib/snapshot'
import { Avatar, Button, InfoIcon, StarIcon, Text, Tooltip } from '../../atoms'

export interface RankingListProps {
  id: 'popular' | 'rising'
  title: string
  hint: string
  items: RankedRepo[]
  /** Rising only: history is too short, items are an approximation. */
  fallback?: boolean
}

export function RankingList({ id, title, hint, items, fallback = false }: RankingListProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? 'en'
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, RANKING_TOP)

  return (
    <section
      className="flex flex-col gap-2"
      data-testid={`ranking-${id}`}
      data-mode={fallback ? 'fallback' : 'normal'}
    >
      <div className="flex items-center gap-1">
        <Text as="h2" variant="heading" className="text-sm">
          {title}
        </Text>
        <Tooltip content={hint}>
          <span className="text-text-muted inline-flex" data-testid={`ranking-${id}-hint`}>
            <InfoIcon size={14} />
          </span>
        </Tooltip>
      </div>
      {fallback ? (
        <Text variant="muted" className="text-xs" data-testid={`ranking-${id}-fallback`}>
          {t('ranking.fallback')}
        </Text>
      ) : null}
      {items.length === 0 ? (
        <Text variant="muted" className="text-xs">
          {t('ranking.empty')}
        </Text>
      ) : (
        <ol className="flex flex-col gap-1">
          {visible.map(({ repo, delta }, index) => (
            <li
              key={repo.fullName}
              className="flex items-center gap-2 text-sm"
              data-testid="ranking-item"
            >
              <span className="text-text-muted w-5 shrink-0 text-right text-xs tabular-nums">
                {index + 1}
              </span>
              <Avatar src={avatarUrl(repo.owner, repo.ownerId)} name={repo.owner} size={20} />
              <a
                href={`https://github.com/${repo.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-accent min-w-0 flex-1 truncate hover:underline"
                title={repo.fullName}
              >
                <span className="text-text-muted">{repo.owner} / </span>
                {repo.name}
              </a>
              <span className="text-text-muted inline-flex shrink-0 items-center gap-0.5 text-xs tabular-nums">
                <StarIcon size={12} />
                {formatCompactNumber(repo.stars, lang)}
              </span>
              {delta !== undefined ? (
                <span
                  className="text-success shrink-0 text-xs tabular-nums"
                  data-testid="ranking-delta"
                >
                  +{formatCompactNumber(delta, lang)}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      )}
      {items.length > RANKING_TOP ? (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setExpanded((v) => !v)}
          data-testid={`ranking-${id}-toggle`}
        >
          {t(expanded ? 'ranking.collapse' : 'ranking.viewAll')}
        </Button>
      ) : null}
    </section>
  )
}
