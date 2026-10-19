import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip'
import type { ReactNode } from 'react'

export interface TooltipProps {
  /** Tooltip body. Strings may contain line breaks. */
  content: ReactNode
  children: ReactNode
  delay?: number
  /** Start open. Mainly for tests and stories. */
  defaultOpen?: boolean
}

const popupClass =
  'max-w-xs rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs leading-relaxed whitespace-pre-line text-text shadow-lg'

/**
 * Styled replacement for the native `title` attribute. The trigger is a focusable
 * span so keyboard users can reach the tooltip too.
 */
export function Tooltip({ content, children, delay = 300, defaultOpen }: TooltipProps) {
  return (
    <BaseTooltip.Root defaultOpen={defaultOpen}>
      <BaseTooltip.Trigger
        delay={delay}
        render={<span tabIndex={0} className="cursor-default rounded-sm" />}
      >
        {children}
      </BaseTooltip.Trigger>
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={6} className="z-50">
          <BaseTooltip.Popup role="tooltip" className={popupClass} data-testid="tooltip">
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
