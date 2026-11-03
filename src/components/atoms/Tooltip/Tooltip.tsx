import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip'
import type { ReactElement, ReactNode } from 'react'

export interface TooltipProps {
  /** Tooltip body. Strings may contain line breaks. */
  content: ReactNode
  children: ReactNode
  delay?: number
  /** Start open. Mainly for tests and stories. */
  defaultOpen?: boolean
  /**
   * Element to use as the trigger instead of the default focusable span. Pass this when the
   * children are already interactive (a link or button) so they do not gain a second tab stop.
   */
  render?: ReactElement
}

const popupClass =
  'max-w-xs rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs leading-relaxed whitespace-pre-line text-text shadow-lg'

/**
 * Styled replacement for the native `title` attribute. By default the trigger is a focusable
 * span so keyboard users can reach the tooltip too; `render` swaps in an element that is
 * already focusable.
 */
export function Tooltip({ content, children, delay = 300, defaultOpen, render }: TooltipProps) {
  return (
    <BaseTooltip.Root defaultOpen={defaultOpen}>
      <BaseTooltip.Trigger
        delay={delay}
        render={render ?? <span tabIndex={0} className="cursor-pointer rounded-sm" />}
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
