import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('shows the initial until the image loads, then fades it in', () => {
    render(<Avatar src="https://example.com/a.png" name="vercel" />)
    const wrapper = screen.getByTestId('avatar')
    expect(wrapper).toHaveTextContent('V')
    expect(wrapper).toHaveAttribute('data-loaded', 'false')
    expect(wrapper).toHaveClass('border-border-strong')
    const img = wrapper.querySelector('img')!
    expect(img).toHaveClass('opacity-0')
    fireEvent.load(img)
    expect(wrapper).toHaveAttribute('data-loaded', 'true')
    expect(img).toHaveClass('opacity-100')
    expect(wrapper).toHaveClass('border-transparent')
  })
})
