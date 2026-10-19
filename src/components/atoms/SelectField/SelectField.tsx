import { Select } from '@base-ui-components/react/select'

import { CheckIcon, ChevronDownIcon } from '../icons'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

export interface SelectFieldProps<T extends string> {
  /** Accessible name for the trigger. */
  label: string
  value: T
  options: readonly SelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  'data-testid'?: string
}

const triggerClass =
  'inline-flex h-11 items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-sm whitespace-nowrap text-text transition-colors hover:bg-surface-muted disabled:opacity-50'
/* Popup is at least as wide as its trigger (--anchor-width comes from Base UI's positioner). */
const popupClass =
  'w-[var(--anchor-width)] min-w-40 rounded-md border border-border bg-surface-raised p-1 shadow-lg outline-none'
const itemClass =
  'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text outline-none data-[highlighted]:bg-surface-muted'

/** Thin Base UI Select wrapper: single value, string options, keyboard accessible. */
export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  'data-testid': testId,
}: SelectFieldProps<T>) {
  const items = Object.fromEntries(options.map((o) => [o.value, o.label])) as Record<T, string>
  return (
    <Select.Root<T>
      value={value}
      items={items}
      disabled={disabled}
      onValueChange={(next) => {
        if (next !== null && next !== value) onChange(next)
      }}
    >
      <Select.Trigger className={triggerClass} aria-label={label} data-testid={testId}>
        <Select.Value />
        <Select.Icon>
          <ChevronDownIcon size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} align="start" className="z-50">
          <Select.Popup className={popupClass}>
            <Select.List>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className={itemClass}>
                  <span className="flex w-4 items-center justify-center" aria-hidden="true">
                    <Select.ItemIndicator>
                      <CheckIcon size={14} />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
