import type { ComponentPropsWithoutRef } from 'react'

export type RadarMarkProps = { size?: number } & Omit<ComponentPropsWithoutRef<'svg'>, 'children'>

/** The product mark: outlined radar rings, a needle and a blip in the brand gradient. Mirrors public/favicon.svg. */
export function RadarMark({ size = 24, ...rest }: RadarMarkProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...rest}>
      <defs>
        <linearGradient id="radar-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1366ff" />
          <stop offset="1" stopColor="#7e14ff" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke="url(#radar-mark-gradient)"
        strokeWidth="3"
      />
      <circle
        cx="16"
        cy="16"
        r="6.5"
        fill="none"
        stroke="url(#radar-mark-gradient)"
        strokeWidth="3"
        strokeOpacity="0.45"
      />
      <path
        d="M16 16 L25.5 7.5"
        stroke="url(#radar-mark-gradient)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.6" fill="url(#radar-mark-gradient)" />
      <circle cx="9.5" cy="20.5" r="2.2" fill="#7e14ff" />
    </svg>
  )
}
