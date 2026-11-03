import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

import '../lib/i18n'

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('kaboom')
  return <p>fine</p>
}

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders children while nothing throws', () => {
    render(
      <ErrorBoundary>
        <Bomb explode={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('fine')).toBeInTheDocument()
    expect(screen.queryByTestId('crash-screen')).toBeNull()
  })

  it('shows the crash screen, reports the error, and reloads on request', async () => {
    // React logs the caught error itself; keep the test output quiet.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onReload = vi.fn()
    render(
      <ErrorBoundary onReload={onReload}>
        <Bomb explode />
      </ErrorBoundary>,
    )
    const screenEl = screen.getByTestId('crash-screen')
    expect(screenEl).toHaveAttribute('role', 'alert')
    expect(screenEl).toHaveTextContent('Something went wrong')
    expect(consoleError).toHaveBeenCalledWith(
      '[osr] render error',
      expect.any(Error),
      expect.stringContaining('Bomb'),
    )
    await userEvent.click(screen.getByTestId('crash-reload'))
    expect(onReload).toHaveBeenCalledTimes(1)
  })
})
