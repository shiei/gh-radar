import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SelectField } from './SelectField'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
] as const

describe('SelectField', () => {
  it('shows the current label and has an accessible name', () => {
    render(<SelectField label="Sort" value="a" options={options} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveTextContent('Alpha')
  })

  it('selects with the keyboard and calls onChange', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<SelectField label="Sort" value="a" options={options} onChange={onChange} />)
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    const beta = await screen.findByRole('option', { name: 'Beta' })
    await user.click(beta)
    expect(onChange).toHaveBeenCalledWith('b')
  })
})
