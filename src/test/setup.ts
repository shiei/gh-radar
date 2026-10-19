import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom lacks these; Base UI / floating-ui expect them.
class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)

if (!('scrollIntoView' in Element.prototype)) {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  })
}

if (typeof window.matchMedia !== 'function') {
  const matchMediaStub = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })
  Object.defineProperty(window, 'matchMedia', {
    value: matchMediaStub,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
