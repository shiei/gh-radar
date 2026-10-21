import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { UserCard } from './UserCard'

import '../../../lib/i18n'

describe('UserCard', () => {
  it('links to the profile and labels organizations', () => {
    render(
      <ul>
        <UserCard
          user={{
            id: 1,
            login: 'vercel',
            avatarUrl: 'https://avatars.githubusercontent.com/u/14985020?v=4',
            htmlUrl: 'https://github.com/vercel',
            kind: 'Organization',
          }}
        />
      </ul>,
    )
    const link = screen.getByTestId('user-link')
    expect(link).toHaveAttribute('href', 'https://github.com/vercel')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveTextContent('vercel')
    expect(screen.getByTestId('user-kind')).toHaveTextContent('Organization')
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })
})
