import { cx } from '../../../lib/cx'
import { SvgIcon, type IconProps } from './Icon'

export function SpinnerIcon({ className, ...props }: IconProps) {
  return (
    <SvgIcon className={cx('animate-spin motion-reduce:animate-none', className)} {...props}>
      <path d="M21 12a9 9 0 1 1-6.2-8.6" />
    </SvgIcon>
  )
}
