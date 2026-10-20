import { SvgIcon, type IconProps } from './Icon'

export function CloseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </SvgIcon>
  )
}
