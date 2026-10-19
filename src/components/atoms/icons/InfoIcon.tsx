import { SvgIcon, type IconProps } from './Icon'

/** Circle-i. The dot is a filled circle so it stays crisp at small sizes. */
export function InfoIcon(props: IconProps) {
  return (
    <SvgIcon strokeWidth={2.25} {...props}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 11v6" />
      <circle cx="12" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
    </SvgIcon>
  )
}
