import { SvgIcon, type IconProps } from './Icon'

export function SearchIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </SvgIcon>
  )
}
