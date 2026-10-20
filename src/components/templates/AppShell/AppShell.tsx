import type { ReactNode } from 'react'

import { Header } from '../../organisms'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface text-text flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">{children}</main>
    </div>
  )
}
