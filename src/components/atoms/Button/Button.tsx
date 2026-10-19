import type { ComponentPropsWithoutRef } from 'react'

import { cx } from '../../../lib/cx'

export type ButtonVariant = 'primary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-text hover:bg-accent-hover',
  ghost: 'bg-transparent text-text hover:bg-surface-muted border border-border',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
}

export type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
} & ComponentPropsWithoutRef<'button'>

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(base, variantClass[variant], sizeClass[size], className)}
      {...rest}
    />
  )
}
