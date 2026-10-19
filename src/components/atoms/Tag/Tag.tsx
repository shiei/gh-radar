import type { ComponentPropsWithoutRef } from 'react'

import { cx } from '../../../lib/cx'

export type TagProps = ComponentPropsWithoutRef<'span'>

export function Tag({ className, ...rest }: TagProps) {
  return (
    <span
      className={cx(
        'bg-surface-muted text-text-muted inline-flex items-center rounded-full px-2 py-0.5 text-xs',
        className,
      )}
      {...rest}
    />
  )
}
