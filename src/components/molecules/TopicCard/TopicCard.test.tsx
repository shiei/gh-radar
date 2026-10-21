import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopicCard } from './TopicCard'

import '../../../lib/i18n'

describe('TopicCard', () => {
  it('shows name, display name, description and badges; the name is a button', async () => {
    const onSelect = vi.fn()
    render(
      <ul>
        <TopicCard
          topic={{
            name: 'machine-learning',
            displayName: 'Machine learning',
            shortDescription: 'Algorithms that learn from data.',
            featured: true,
            curated: true,
          }}
          onSelect={onSelect}
        />
      </ul>,
    )
    expect(screen.getByTestId('topic-display-name')).toHaveTextContent('Machine learning')
    expect(screen.getByTestId('topic-description')).toHaveTextContent('Algorithms')
    expect(screen.getByTestId('topic-featured')).toBeInTheDocument()
    expect(screen.getByTestId('topic-curated')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('topic-name'))
    expect(onSelect).toHaveBeenCalledWith('machine-learning')
  })

  it('omits optional parts', () => {
    render(
      <ul>
        <TopicCard
          topic={{
            name: 'react',
            displayName: 'react',
            shortDescription: null,
            featured: false,
            curated: false,
          }}
          onSelect={vi.fn()}
        />
      </ul>,
    )
    expect(screen.queryByTestId('topic-display-name')).toBeNull()
    expect(screen.queryByTestId('topic-description')).toBeNull()
    expect(screen.queryByTestId('topic-featured')).toBeNull()
  })
})
