import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tooltip } from './Tooltip'

// Hover and focus-visible behaviour is exercised in Playwright (real pointer events);
// jsdom cannot drive Base UI's hover/focus-visible detection reliably.
describe('Tooltip', () => {
  it('renders a focusable trigger around its children', () => {
    render(
      <Tooltip content="Exact time">
        <span>3 days ago</span>
      </Tooltip>,
    )
    const trigger = screen.getByText('3 days ago').parentElement
    expect(trigger).toHaveAttribute('tabindex', '0')
  })

  it('renders the content with tooltip semantics when open', async () => {
    render(
      <Tooltip content={'Line one\nExact time'} defaultOpen>
        <span>3 days ago</span>
      </Tooltip>,
    )
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('Exact time')
    expect(tip).toHaveClass('rounded-lg', 'px-3', 'py-2')
  })
})
