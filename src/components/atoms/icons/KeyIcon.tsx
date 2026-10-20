import { SvgIcon, type IconProps } from './Icon'

export function KeyIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2 20 3M15 8l3 3M13 10l2 2" />
    </SvgIcon>
  )
}
