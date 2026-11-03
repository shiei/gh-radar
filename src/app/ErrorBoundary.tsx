import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Text } from '../components/atoms'
import { reportError } from '../lib/report'

export interface ErrorBoundaryProps {
  children: ReactNode
  /** What the reload button does; defaults to a full page reload. */
  onReload?: () => void
}

interface ErrorBoundaryState {
  failed: boolean
}

function CrashScreen({ onReload }: { onReload: () => void }) {
  const { t } = useTranslation()
  return (
    <main
      role="alert"
      className="bg-surface text-text mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-[30px] text-center"
      data-testid="crash-screen"
    >
      <Text as="h1" variant="heading">
        {t('crash.title')}
      </Text>
      <Text variant="muted" className="text-sm">
        {t('crash.body')}
      </Text>
      <Button onClick={onReload} data-testid="crash-reload">
        {t('crash.reload')}
      </Button>
    </main>
  )
}

/**
 * Last line of defence for render errors: instead of React unmounting everything into a
 * blank page, show a short notice with a reload button and report the error.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { source: 'render', componentStack: info.componentStack ?? undefined })
  }

  render() {
    if (!this.state.failed) return this.props.children
    const onReload = this.props.onReload ?? (() => window.location.reload())
    return <CrashScreen onReload={onReload} />
  }
}
