import type { ComponentPropsWithoutRef, ElementType } from 'react'

import { cx } from '../../../lib/cx'

export type TextVariant = 'body' | 'muted' | 'title' | 'heading'

const variantClass: Record<TextVariant, string> = {
  body: 'text-base text-text',
  muted: 'text-sm text-text-muted',
  title: 'text-2xl font-semibold text-text',
  heading: 'text-lg font-semibold text-text',
}

type TextProps<T extends ElementType> = {
  as?: T
  variant?: TextVariant
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  className,
  ...rest
}: TextProps<T>) {
  const Component: ElementType = as ?? 'p'
  return <Component className={cx(variantClass[variant], className)} {...rest} />
}
