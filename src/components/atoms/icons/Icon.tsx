import type { ComponentPropsWithoutRef } from 'react'

export type IconProps = {
  /** Pixel size; icons are square. */
  size?: number
  /** Accessible label. When omitted the icon is decorative (aria-hidden). */
  title?: string
} & Omit<ComponentPropsWithoutRef<'svg'>, 'children'>

type SvgIconProps = IconProps & { children: React.ReactNode }

/** Base wrapper shared by every SVG icon atom. */
export function SvgIcon({ size = 20, title, children, ...rest }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}
