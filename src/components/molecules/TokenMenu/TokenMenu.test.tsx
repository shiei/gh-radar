import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getToken, resetTokenForTests, setRateLimit, setToken } from '../../../lib/github'
import { TokenMenu } from './TokenMenu'

import '../../../lib/i18n'

const okRateLimit = () =>
  new Response(
    JSON.stringify({ resources: { search: { limit: 30, remaining: 29, reset: 1760000000 } } }),
    { status: 200 },
  )

describe('TokenMenu', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    window.localStorage.clear()
    resetTokenForTests()
    setToken('')
    setRateLimit(null)
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows the connect prompt when no token is set', () => {
    render(<TokenMenu />)
    expect(screen.getByTestId('token-label')).toHaveTextContent('Connect GitHub')
    expect(screen.getByTestId('token-trigger')).toHaveAttribute('data-token-state', 'none')
  })

  it('validates and saves a token, then shows the quota', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue(okRateLimit())
    render(<TokenMenu />)
    await user.click(screen.getByTestId('token-trigger'))
    await user.type(await screen.findByTestId('token-input'), 'ghp_valid')
    await user.click(screen.getByTestId('token-save'))
    await waitFor(() => expect(getToken()).toBe('ghp_valid'))
    expect(screen.getByTestId('token-label')).toHaveTextContent('29 / 30')
    expect(screen.queryByTestId('token-popup')).toBeNull()
  })

  it('rejects an invalid token and keeps the input', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValue(new Response('{}', { status: 401 }))
    render(<TokenMenu />)
    await user.click(screen.getByTestId('token-trigger'))
    await user.type(await screen.findByTestId('token-input'), 'bad')
    await user.click(screen.getByTestId('token-save'))
    expect(await screen.findByTestId('token-error')).toHaveTextContent('rejected')
    expect(getToken()).toBeNull()
    expect(screen.getByTestId('token-input')).toHaveValue('bad')
  })

  it('does not validate blank input', async () => {
    const user = userEvent.setup()
    render(<TokenMenu />)
    await user.click(screen.getByTestId('token-trigger'))
    await screen.findByTestId('token-input')
    expect(screen.getByTestId('token-save')).toBeDisabled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('removes a saved token', async () => {
    const user = userEvent.setup()
    setToken('ghp_saved')
    render(<TokenMenu />)
    expect(screen.getByTestId('token-label')).toHaveTextContent('GitHub token set')
    await user.click(screen.getByTestId('token-trigger'))
    expect(await screen.findByTestId('token-input')).toHaveValue('')
    await user.click(screen.getByTestId('token-remove'))
    expect(getToken()).toBeNull()
    expect(screen.getByTestId('token-label')).toHaveTextContent('Connect GitHub')
  })
})
