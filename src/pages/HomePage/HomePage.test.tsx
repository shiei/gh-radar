import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '../../lib/theme'
import { resetSnapshotCache } from '../../features/rankings'
import { HomePage } from './HomePage'

import '../../lib/i18n'

const body = {
  total_count: 1,
  incomplete_results: false,
  items: [
    {
      id: 1,
      name: 'react',
      full_name: 'facebook/react',
      html_url: 'https://github.com/facebook/react',
      description: 'The library',
      stargazers_count: 100,
      language: 'JavaScript',
      updated_at: '2026-01-01T00:00:00Z',
      topics: ['react'],
      license: { spdx_id: 'MIT', name: 'MIT' },
      owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' },
      pushed_at: '2026-01-01T00:00:00Z',
      created_at: '2020-01-01T00:00:00Z',
    },
  ],
}

describe('HomePage', () => {
  const fetchMock = vi.fn<typeof fetch>()
  beforeEach(() => {
    resetSnapshotCache()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('shows result cards after submitting a search', async () => {
    fetchMock.mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (url.includes('/data/')) return Promise.resolve(new Response('{}', { status: 404 }))
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
    })
    render(
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>,
    )
    expect(screen.queryByTestId('search-results')).toBeNull()
    await userEvent.type(screen.getByTestId('search-input'), 'react{Enter}')
    expect(await screen.findByTestId('repo-card')).toHaveTextContent('facebook / react')
    expect(screen.getByTestId('result-count')).toHaveTextContent('1 repositories matched')
    const searchCall = fetchMock.mock.calls.find(
      (c) => typeof c[0] === 'string' && c[0].includes('/search/'),
    )
    expect(searchCall?.[0]).toContain('q=react')
    expect(await screen.findByTestId('rankings-missing')).toBeInTheDocument()
  })
})
