import { useState } from 'react'

import { cx } from '../../../lib/cx'

export interface AvatarProps {
  src: string
  /** Used for the placeholder initial while the image loads. */
  name: string
  size?: number
  className?: string
}

/**
 * Round avatar that shows the owner's initial until the image arrives, then fades the
 * image in. No spinner: a letter is cheaper and reads fine when the image never loads.
 */
export function Avatar({ src, name, size = 20, className }: AvatarProps) {
  const [loaded, setLoaded] = useState(false)
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      className={cx(
        'bg-surface-muted text-text-muted relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border select-none',
        // A visible ring while the placeholder shows; it fades out with the image fade-in.
        loaded ? 'border-transparent' : 'border-border-strong',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.5)) }}
      data-testid="avatar"
      data-loaded={loaded ? 'true' : 'false'}
    >
      <span aria-hidden="true">{initial}</span>
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cx(
          'absolute inset-0 h-full w-full transition-opacity duration-200',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </span>
  )
}
