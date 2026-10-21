import type { ReactNode } from 'react'

import { CornerDecor, Footer, Header } from '../../organisms'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface text-text flex min-h-screen flex-col">
      <Header />
      {/* Decorations are positioned against this wrapper, behind main and outside its box. */}
      <div className="relative flex flex-1 flex-col">
        <CornerDecor />
        <main className="relative mx-auto w-full max-w-7xl flex-1 px-[30px] py-10 lg:px-4">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
