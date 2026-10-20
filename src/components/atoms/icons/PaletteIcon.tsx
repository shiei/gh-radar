import { SvgIcon, type IconProps } from './Icon'

export function PaletteIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.9 2-2 0-.6-.3-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1 .9-1.8 2-1.8H17a4 4 0 0 0 4-4c0-4.4-4-7.5-9-7.5z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10.5" cy="7" r="1" />
      <circle cx="15.5" cy="7" r="1" />
    </SvgIcon>
  )
}
