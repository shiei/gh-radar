import { SvgIcon, type IconProps } from './Icon'

export function MonitorIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </SvgIcon>
  )
}
