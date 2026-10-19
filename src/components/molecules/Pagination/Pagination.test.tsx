import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from './Pagination'

import '../../../lib/i18n'

describe('Pagination', () => {
  it('disables previous on the first page and highlights the current page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByTestId('page-previous')).toBeDisabled()
    expect(screen.getByTestId('page-next')).toBeEnabled()
    const current = screen.getByTestId('page-current')
    expect(current).toHaveTextContent('1')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveClass('bg-accent')
    expect(screen.getAllByTestId('page-link').map((el) => el.textContent)).toEqual([
      '2',
      '3',
      '4',
      '5',
    ])
  })

  it('disables next on the last page', () => {
    render(<Pagination page={100} totalPages={100} onPageChange={vi.fn()} />)
    expect(screen.getByTestId('page-next')).toBeDisabled()
    expect(screen.getByTestId('page-previous')).toBeEnabled()
    expect(screen.getAllByTestId('page-link').map((el) => el.textContent)).toEqual([
      '1',
      '98',
      '99',
    ])
  })

  it('disables both on a single page', () => {
    render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(screen.getByTestId('page-previous')).toBeDisabled()
    expect(screen.getByTestId('page-next')).toBeDisabled()
    expect(screen.queryAllByTestId('page-link')).toHaveLength(0)
  })

  it('numbered links jump straight to that page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={100} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Page 100 of 100' }))
    expect(onPageChange).toHaveBeenCalledWith(100)
    await userEvent.click(screen.getByTestId('page-next'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
