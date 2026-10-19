import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StatusMessage } from './StatusMessage'

import '../../../lib/i18n'

describe('StatusMessage', () => {
  it('renders loading and empty states', () => {
    const { rerender } = render(<StatusMessage status="loading" />)
    expect(screen.getByTestId('search-loading')).toHaveTextContent('Searching')
    rerender(<StatusMessage status="empty" />)
    expect(screen.getByTestId('search-empty')).toHaveTextContent('No repositories matched')
  })

  it('rate limited with reset time mentions the time', () => {
    const resetAt = new Date('2026-10-19T14:32:00Z')
    render(
      <StatusMessage status="error" error={{ kind: 'rate_limited', resetAt }} onRetry={vi.fn()} />,
    )
    const text = screen.getByTestId('search-error-text')
    expect(text).toHaveTextContent('request limit')
    expect(text).toHaveTextContent(/32/)
  })

  it('rate limited without reset time omits the retry hint', () => {
    render(
      <StatusMessage
        status="error"
        error={{ kind: 'rate_limited', resetAt: null }}
        onRetry={vi.fn()}
      />,
    )
    expect(screen.getByTestId('search-error-text')).not.toHaveTextContent('try again after')
  })

  it('invalid query, network and api have distinct copy', () => {
    const { rerender } = render(
      <StatusMessage status="error" error={{ kind: 'invalid_query' }} onRetry={vi.fn()} />,
    )
    expect(screen.getByTestId('search-error-text')).toHaveTextContent('could not understand')
    rerender(<StatusMessage status="error" error={{ kind: 'network' }} onRetry={vi.fn()} />)
    expect(screen.getByTestId('search-error-text')).toHaveTextContent('Could not reach')
    rerender(
      <StatusMessage status="error" error={{ kind: 'api', status: 503 }} onRetry={vi.fn()} />,
    )
    expect(screen.getByTestId('search-error-text')).toHaveTextContent('503')
  })

  it('retry button calls onRetry', async () => {
    const onRetry = vi.fn()
    render(<StatusMessage status="error" error={{ kind: 'network' }} onRetry={onRetry} />)
    await userEvent.click(screen.getByTestId('search-retry'))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
