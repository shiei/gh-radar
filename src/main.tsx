import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/globals.css'
import './lib/i18n'
import { App } from './app/App'
import { ErrorBoundary } from './app/ErrorBoundary'
import { installGlobalErrorHandlers } from './lib/report'

installGlobalErrorHandlers()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
