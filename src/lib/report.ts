export interface ErrorContext {
  /** Where the error surfaced: a React render, window.onerror, an unhandled promise, or app code. */
  source: 'render' | 'window' | 'promise' | 'manual'
  componentStack?: string
}

/**
 * The one place runtime errors go. Today that is the console; a hosted sink (Sentry, a
 * GitHub issue webhook, ...) plugs in here and nowhere else. Must never throw: it is called
 * from error paths that have no further safety net.
 */
export function reportError(error: unknown, context: ErrorContext): void {
  try {
    const detail = context.componentStack ? `\n${context.componentStack}` : ''
    console.error(`[osr] ${context.source} error`, error, detail)
  } catch {
    // Nothing left to do: reporting is best effort.
  }
}

/** Route errors that escape React (event handlers, async code) through reportError too. */
export function installGlobalErrorHandlers(target: Window = window): () => void {
  const onError = (event: ErrorEvent) => {
    reportError(event.error ?? event.message, { source: 'window' })
  }
  const onRejection = (event: PromiseRejectionEvent) => {
    reportError(event.reason, { source: 'promise' })
  }
  target.addEventListener('error', onError)
  target.addEventListener('unhandledrejection', onRejection)
  return () => {
    target.removeEventListener('error', onError)
    target.removeEventListener('unhandledrejection', onRejection)
  }
}
