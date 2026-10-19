import { AppShell } from '../components/templates'
import { ThemeProvider } from '../lib/theme'
import { HomePage } from '../pages'

export function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <HomePage />
      </AppShell>
    </ThemeProvider>
  )
}
