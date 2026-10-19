import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('renders a type=button with primary token classes by default', () => {
    render(<Button>Go</Button>)
    const el = screen.getByRole('button', { name: 'Go' })
    expect(el).toHaveAttribute('type', 'button')
    expect(el).toHaveClass('bg-accent', 'text-accent-text')
  })

  it('applies ghost variant and small size', () => {
    render(
      <Button variant="ghost" size="sm">
        Quiet
      </Button>,
    )
    expect(screen.getByRole('button')).toHaveClass('border-border', 'h-8')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Tap</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
