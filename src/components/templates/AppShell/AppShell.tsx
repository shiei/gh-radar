import type { ReactNode } from 'react'

import { Header } from '../../organisms'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface text-text flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-[30px] py-10 lg:px-4">{children}</main>
    </div>
  )
}
