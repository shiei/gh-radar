import type { ComponentPropsWithoutRef } from 'react'

import { cx } from '../../../lib/cx'

const base =
  'h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-text placeholder:text-text-muted focus:border-accent focus:outline-none disabled:opacity-50'

export type InputProps = ComponentPropsWithoutRef<'input'>

export function Input({ className, type = 'text', ...rest }: InputProps) {
  return <input type={type} className={cx(base, className)} {...rest} />
}
