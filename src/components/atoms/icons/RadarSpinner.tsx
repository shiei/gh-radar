import { cx } from '../../../lib/cx'

export interface RadarSpinnerProps {
  size?: number
  className?: string
}

/**
 * Loading indicator shaped like the product mark: an outer ring and a sweep that
 * spins once a second. Pure CSS animation on an inline SVG, so it restarts on every mount.
 */
export function RadarSpinner({ size = 20, className }: RadarSpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={cx('shrink-0', className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.3"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.18"
      />
      <g className="origin-center animate-[spin_1s_linear_infinite] motion-reduce:animate-none">
        {/* 60° sweep fading toward its trailing edge, plus a solid leading edge */}
        <path d="M12 12 L21 12 A9 9 0 0 0 16.5 4.2 Z" fill="currentColor" fillOpacity="0.28" />
        <path d="M12 12 L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  )
}
