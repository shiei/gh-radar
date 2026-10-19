import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Repository } from '../../../lib/github'
import { RepositoryCard } from './RepositoryCard'

import '../../../lib/i18n'

const full: Repository = {
  id: 1,
  owner: 'facebook',
  avatarUrl: 'https://avatars.githubusercontent.com/u/69631?v=4',
  name: 'react',
  fullName: 'facebook/react',
  htmlUrl: 'https://github.com/facebook/react',
  description: 'The library',
  stars: 12800,
  language: 'JavaScript',
  updatedAt: '2026-10-16T12:00:00Z',
  topics: ['react', 'ui'],
  license: 'MIT',
  pushedAt: '2026-10-18T12:00:00Z',
  createdAt: '2013-05-24T16:15:54Z',
  archived: false,
  isFork: false,
  isTemplate: false,
  openIssues: 1100,
  forks: 48000,
  ownerType: 'Organization',
  homepage: 'https://react.dev',
  sizeKb: 500000,
}

describe('RepositoryCard', () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date('2026-10-19T12:00:00Z'), toFake: ['Date'] }))
  afterEach(() => vi.useRealTimers())

  it('renders every fact for a full repository', () => {
    render(
      <ul>
        <RepositoryCard repo={full} />
      </ul>,
    )
    const link = screen.getByTestId('repo-link')
    expect(link).toHaveAttribute('href', 'https://github.com/facebook/react')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveTextContent('facebook / react')
    expect(screen.getByTestId('repo-avatar')).toHaveAttribute(
      'src',
      'https://avatars.githubusercontent.com/u/69631?v=4&s=48',
    )
    expect(screen.getByTestId('repo-stars')).toHaveTextContent('12.8K')
    expect(screen.getByTestId('repo-description')).toHaveTextContent('The library')
    expect(screen.getByTestId('repo-language')).toHaveTextContent('JavaScript')
    expect(screen.getByTestId('repo-license')).toHaveTextContent('MIT')
    expect(screen.getByTestId('repo-updated')).toHaveTextContent('3 days ago')
    expect(screen.getByTestId('repo-topics').querySelectorAll('li')).toHaveLength(2)
    expect(screen.getByTestId('repo-activity')).toHaveAttribute('data-activity', 'active')
    expect(screen.getByTestId('repo-pushed')).toHaveTextContent('yesterday')
    expect(screen.getByTestId('repo-rate')).toHaveTextContent('/ month')
    expect(screen.getByTestId('repo-forks')).toHaveTextContent('48000 forks')
    expect(screen.getByTestId('repo-issues')).toHaveTextContent('1100 open issues')
    expect(screen.getByTestId('repo-size')).toHaveTextContent('488.3 MB')
    expect(screen.getByTestId('repo-owner-type')).toHaveTextContent('Organization')
    expect(screen.getByTestId('repo-homepage')).toHaveAttribute('href', 'https://react.dev')
    expect(screen.queryByTestId('repo-archived')).toBeNull()
  })

  it('omits missing facts instead of showing placeholders', () => {
    render(
      <ul>
        <RepositoryCard
          repo={{
            ...full,
            description: null,
            license: null,
            topics: [],
            language: null,
            avatarUrl: null,
          }}
        />
      </ul>,
    )
    expect(screen.queryByTestId('repo-description')).toBeNull()
    expect(screen.queryByTestId('repo-license')).toBeNull()
    expect(screen.queryByTestId('repo-topics')).toBeNull()
    expect(screen.queryByTestId('repo-language')).toBeNull()
    expect(screen.queryByTestId('repo-avatar')).toBeNull()
    expect(screen.getByTestId('repo-stars')).toBeInTheDocument()
  })
})
