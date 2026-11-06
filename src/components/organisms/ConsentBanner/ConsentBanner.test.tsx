import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createConsentStore } from '../../../lib/analytics'
import { ConsentBanner } from './ConsentBanner'

import '../../../lib/i18n'

describe('ConsentBanner', () => {
  it('asks until the visitor answers, then records an accept', async () => {
    const store = createConsentStore(null)
    render(<ConsentBanner store={store} />)
    expect(screen.getByTestId('consent-banner')).toHaveTextContent('cookies')
    await userEvent.click(screen.getByTestId('consent-accept'))
    expect(store.get()).toBe('granted')
    expect(screen.queryByTestId('consent-banner')).toBeNull()
  })

  it('records a decline the same way', async () => {
    const store = createConsentStore(null)
    render(<ConsentBanner store={store} />)
    await userEvent.click(screen.getByTestId('consent-decline'))
    expect(store.get()).toBe('denied')
    expect(screen.queryByTestId('consent-banner')).toBeNull()
  })

  it('stays hidden when a decision is already stored, and reappears on reset', () => {
    const store = createConsentStore(null)
    store.set('denied')
    render(<ConsentBanner store={store} />)
    expect(screen.queryByTestId('consent-banner')).toBeNull()
    act(() => store.set(null))
    expect(screen.getByTestId('consent-banner')).toBeInTheDocument()
  })
})
