import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { RankedRepo } from '../../../lib/rankings'
import { RankingList } from './RankingList'

import '../../../lib/i18n'

const item = (n: number, delta?: number): RankedRepo => ({
  repo: {
    fullName: `o/r${String(n)}`,
    owner: 'o',
    name: `r${String(n)}`,
    stars: 1000 * n,
    forks: 0,
    openIssues: 0,
    pushedAt: '',
    createdAt: '',
    language: null,
    topics: [],
    archived: false,
    sources: [],
  },
  delta,
})

describe('RankingList', () => {
  it('shows five, expands to all, and shows deltas', async () => {
    const items = Array.from({ length: 12 }, (_, i) => item(i + 1, 10 * (i + 1)))
    render(<RankingList id="rising" title="Rising Stars" hint="h" items={items} />)
    expect(screen.getAllByTestId('ranking-item')).toHaveLength(5)
    expect(screen.getAllByTestId('ranking-delta')[0]).toHaveTextContent('+10')
    await userEvent.click(screen.getByTestId('ranking-rising-toggle'))
    expect(screen.getAllByTestId('ranking-item')).toHaveLength(12)
    expect(screen.getByTestId('ranking-rising-toggle')).toHaveTextContent('Show less')
  })

  it('labels the fallback mode and the empty state', () => {
    const { rerender } = render(
      <RankingList id="rising" title="R" hint="h" items={[item(1)]} fallback />,
    )
    expect(screen.getByTestId('ranking-rising')).toHaveAttribute('data-mode', 'fallback')
    expect(screen.getByTestId('ranking-rising-fallback')).toBeInTheDocument()
    rerender(<RankingList id="popular" title="P" hint="h" items={[]} />)
    expect(screen.getByText('Nothing to rank yet')).toBeInTheDocument()
    expect(screen.queryByTestId('ranking-popular-toggle')).toBeNull()
  })
})
