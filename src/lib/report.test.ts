import { afterEach, describe, expect, it, vi } from 'vitest'

import { installGlobalErrorHandlers, reportError } from './report'

describe('reportError', () => {
  afterEach(() => vi.restoreAllMocks())

  it('logs the source and never throws, even when the console does', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    reportError(new Error('boom'), { source: 'manual' })
    expect(spy).toHaveBeenCalledWith('[osr] manual error', expect.any(Error), '')
    spy.mockImplementation(() => {
      throw new Error('console broken')
    })
    expect(() => reportError('x', { source: 'manual' })).not.toThrow()
  })

  it('installs window handlers for errors and rejections and can remove them', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const remove = vi.spyOn(window, 'removeEventListener')
    // Mark the synthetic events as handled so the test runner does not treat them as crashes.
    const swallow = (event: Event) => event.preventDefault()
    window.addEventListener('error', swallow)
    window.addEventListener('unhandledrejection', swallow)
    try {
      const uninstall = installGlobalErrorHandlers()
      window.dispatchEvent(new ErrorEvent('error', { error: new Error('late'), cancelable: true }))
      expect(spy).toHaveBeenLastCalledWith('[osr] window error', expect.any(Error), '')
      const rejection = new Event('unhandledrejection', { cancelable: true })
      Object.defineProperty(rejection, 'reason', { value: 'nope' })
      window.dispatchEvent(rejection)
      expect(spy).toHaveBeenLastCalledWith('[osr] promise error', 'nope', '')
      uninstall()
      expect(remove).toHaveBeenCalledWith('error', expect.any(Function))
      expect(remove).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
    } finally {
      window.removeEventListener('error', swallow)
      window.removeEventListener('unhandledrejection', swallow)
    }
  })
})
