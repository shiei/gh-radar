import { Switch } from '@base-ui-components/react/switch'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../../lib/theme'
import { MoonIcon, SunIcon } from '../../atoms/icons'

const rootClass =
  'relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-muted p-0.5 transition-colors hover:border-border-strong'
const trackIconClass =
  'pointer-events-none flex h-6 w-6 items-center justify-center text-text-muted transition-opacity duration-300'
const thumbClass =
  'absolute left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised text-text shadow-md transition-transform duration-300 ease-out data-[checked]:translate-x-6 motion-reduce:transition-none'

/** Sliding light/dark switch. Checked = dark. The thumb carries the active theme's icon. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'

  return (
    <Switch.Root
      checked={isDark}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      aria-label={t('theme.toggle.label')}
      title={isDark ? t('theme.toggle.toLight') : t('theme.toggle.toDark')}
      className={rootClass}
      data-testid="theme-toggle"
    >
      {/* Track icons: the inactive side stays visible, the active side sits under the thumb. */}
      <span className={trackIconClass} style={{ opacity: isDark ? 1 : 0 }}>
        <SunIcon size={16} />
      </span>
      <span className={trackIconClass} style={{ opacity: isDark ? 0 : 1 }}>
        <MoonIcon size={16} />
      </span>
      <Switch.Thumb className={thumbClass}>
        {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
      </Switch.Thumb>
    </Switch.Root>
  )
}
