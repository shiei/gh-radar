import { Dialog } from '@base-ui-components/react/dialog'
import { useTranslation } from 'react-i18next'

import { CloseIcon, MenuIcon, Text } from '../../atoms'
import { LanguageSwitcher, ThemeToggle, TokenMenu } from '../../molecules'

const triggerClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-text transition-colors hover:bg-surface-muted'
const backdropClass =
  'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0'
const popupClass =
  'fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-6 border-l border-border bg-surface p-5 shadow-xl outline-none transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full motion-reduce:transition-none'

/** Narrow-screen home for the header controls: a hamburger that slides a drawer in from the right. */
export function SettingsDrawer() {
  const { t } = useTranslation()
  return (
    <Dialog.Root>
      <Dialog.Trigger className={triggerClass} aria-label={t('menu.open')} data-testid="menu-open">
        <MenuIcon size={20} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className={backdropClass} />
        <Dialog.Popup className={popupClass} data-testid="settings-drawer">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-text text-base font-semibold">
              {t('menu.title')}
            </Dialog.Title>
            <Dialog.Close
              className={triggerClass}
              aria-label={t('menu.close')}
              data-testid="menu-close"
            >
              <CloseIcon size={18} />
            </Dialog.Close>
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="muted" className="text-xs">
              {t('menu.token')}
            </Text>
            <TokenMenu />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="muted" className="text-xs">
              {t('menu.language')}
            </Text>
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col gap-2">
            <Text variant="muted" className="text-xs">
              {t('menu.theme')}
            </Text>
            <ThemeToggle />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
