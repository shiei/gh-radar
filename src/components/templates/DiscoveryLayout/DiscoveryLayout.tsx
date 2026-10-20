import type { ReactNode } from 'react'

export interface DiscoveryLayoutProps {
  hero: ReactNode
  /** Sidebar content on wide screens. */
  sidebar: ReactNode
  /** Narrow-screen replacement for the sidebar, rendered above `main`. */
  chips: ReactNode
  main: ReactNode
  aside: ReactNode
  /** Narrow screens only: show `aside` under `main` (wide screens always show it). */
  showAsideBelow: boolean
}

/** Three columns from lg up (sidebar / main / aside); a single column below. */
export function DiscoveryLayout({
  hero,
  sidebar,
  chips,
  main,
  aside,
  showAsideBelow,
}: DiscoveryLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      {hero}
      <div
        className="flex flex-col gap-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)_18rem] lg:items-start lg:gap-8"
        data-testid="discovery-grid"
      >
        <div className="hidden lg:block" data-testid="discovery-sidebar">
          {sidebar}
        </div>
        <div className="lg:hidden" data-testid="discovery-chips">
          {chips}
        </div>
        <div className="flex min-w-0 flex-col gap-6" data-testid="discovery-main">
          {main}
        </div>
        <div className={showAsideBelow ? 'block' : 'hidden lg:block'} data-testid="discovery-aside">
          {aside}
        </div>
      </div>
    </div>
  )
}
