import { useTranslation } from 'react-i18next'

import type { UserResult } from '../../../lib/github'
import { Avatar, ExternalLinkIcon, Tag } from '../../atoms'

export interface UserCardProps {
  user: UserResult
}

export function UserCard({ user }: UserCardProps) {
  const { t } = useTranslation()
  return (
    <li
      className="border-border bg-surface hover:border-border-strong flex items-center gap-3 rounded-lg border p-3 transition-colors"
      data-testid="user-card"
    >
      {user.avatarUrl ? (
        <Avatar
          src={`${user.avatarUrl}${user.avatarUrl.includes('?') ? '&' : '?'}s=80`}
          name={user.login}
          size={40}
        />
      ) : (
        <Avatar src="" name={user.login} size={40} />
      )}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <a
          href={user.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('search.user.open', { login: user.login })}
          className="text-accent inline-flex items-center gap-1 truncate text-base font-semibold hover:underline"
          data-testid="user-link"
        >
          {user.login}
          <ExternalLinkIcon size={12} />
        </a>
        <Tag data-testid="user-kind">{t(`search.repo.owner.${user.kind}`)}</Tag>
      </div>
    </li>
  )
}
