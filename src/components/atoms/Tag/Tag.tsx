import type { ComponentPropsWithoutRef } from 'react'

import { cx } from '../../../lib/cx'

const base =
  'inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted'

export type TagProps = ComponentPropsWithoutRef<'span'>

export function Tag({ className, ...rest }: TagProps) {
  return <span className={cx(base, className)} {...rest} />
}

export type TagButtonProps = ComponentPropsWithoutRef<'button'>

/** Clickable tag: same look, real button semantics. */
export function TagButton({ className, type = 'button', ...rest }: TagButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        base,
        'hover:bg-accent hover:text-accent-text cursor-pointer transition-colors',
        className,
      )}
      {...rest}
    />
  )
}
