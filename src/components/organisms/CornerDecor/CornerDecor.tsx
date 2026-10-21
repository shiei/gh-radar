import { useTheme, type Theme } from '../../../lib/theme'

const SRC: Record<Theme, { left: string; right: string }> = {
  dark: {
    left: `${import.meta.env.BASE_URL}deco-left-dark.svg`,
    right: `${import.meta.env.BASE_URL}deco-right-dark.svg`,
  },
  light: {
    left: `${import.meta.env.BASE_URL}deco-left-light.svg`,
    right: `${import.meta.env.BASE_URL}deco-right-light.svg`,
  },
}

const imgClass =
  'pointer-events-none absolute top-0 h-32 w-36 opacity-80 select-none sm:h-36 sm:w-40 min-[998px]:hidden'

/**
 * Below 998px the hero radar is hidden; two clusters of scanned items sit in the page's
 * top corners, outside <main>, so they never take layout space from the content.
 */
export function CornerDecor() {
  const { theme } = useTheme()
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-0"
      aria-hidden="true"
      data-testid="corner-decor"
    >
      <img src={SRC[theme].left} alt="" width={240} height={220} className={`${imgClass} left-0`} />
      <img
        src={SRC[theme].right}
        alt=""
        width={240}
        height={220}
        className={`${imgClass} right-0`}
      />
    </div>
  )
}
