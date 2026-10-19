import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from './Input'

describe('Input', () => {
  it('forwards value and onChange', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="q" value="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox', { name: 'q' }), 'r')
    expect(onChange).toHaveBeenCalled()
  })
})
