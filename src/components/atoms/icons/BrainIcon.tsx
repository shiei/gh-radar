import { SvgIcon, type IconProps } from './Icon'

export function BrainIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4a3 3 0 0 0-3-2 3 3 0 0 0-3 3 3 3 0 0 0-2.5 4A3 3 0 0 0 4 13a3 3 0 0 0 1.5 4A3 3 0 0 0 9 20a3 3 0 0 0 3-2z" />
      <path d="M12 4a3 3 0 0 1 3-2 3 3 0 0 1 3 3 3 3 0 0 1 2.5 4A3 3 0 0 1 20 13a3 3 0 0 1-1.5 4A3 3 0 0 1 15 20a3 3 0 0 1-3-2z" />
      <path d="M12 4v14" />
    </SvgIcon>
  )
}
