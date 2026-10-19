import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Text } from './Text'

describe('Text', () => {
  it('renders a paragraph with body classes by default', () => {
    render(<Text>hello</Text>)
    const el = screen.getByText('hello')
    expect(el.tagName).toBe('P')
    expect(el).toHaveClass('text-text')
  })

  it('renders the requested element and variant', () => {
    render(
      <Text as="h1" variant="title">
        Title
      </Text>,
    )
    const el = screen.getByRole('heading', { level: 1 })
    expect(el).toHaveClass('text-2xl', 'text-text')
  })

  it('uses muted token for muted variant', () => {
    render(<Text variant="muted">note</Text>)
    expect(screen.getByText('note')).toHaveClass('text-text-muted')
  })
})
