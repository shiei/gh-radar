import { Switch } from '@base-ui-components/react/switch'

import { cx } from '../../../lib/cx'

export interface SwitchFieldProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  'data-testid'?: string
}

const rootClass =
  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-muted p-0.5 transition-colors data-[checked]:border-accent data-[checked]:bg-accent focus-visible:outline-2'
const thumbClass =
  'h-3.5 w-3.5 rounded-full bg-surface-raised shadow transition-transform duration-200 data-[checked]:translate-x-4 motion-reduce:transition-none'

/** Small labelled on/off switch; the whole label toggles it. */
export function SwitchField({
  label,
  checked,
  onCheckedChange,
  className,
  'data-testid': testId,
}: SwitchFieldProps) {
  return (
    <label
      className={cx('flex cursor-pointer items-center justify-between gap-3 text-sm', className)}
    >
      <span>{label}</span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={rootClass}
        data-testid={testId}
      >
        <Switch.Thumb className={thumbClass} />
      </Switch.Root>
    </label>
  )
}
