import { Select } from '@base-ui-components/react/select'
import { useTranslation } from 'react-i18next'

import { isLanguage, LANGUAGES, type Language } from '../../../lib/i18n'
import { CheckIcon, ChevronDownIcon, GlobeIcon } from '../../atoms/icons'

const triggerClass =
  'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm text-text transition-colors hover:bg-surface-muted'
const popupClass =
  'min-w-36 rounded-md border border-border bg-surface-raised p-1 shadow-lg outline-none'
const itemClass =
  'grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text outline-none data-[highlighted]:bg-surface-muted'

/** Picks the UI language. Option labels are each language's own name. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current: Language = isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'en'

  const items = Object.fromEntries(
    LANGUAGES.map((lang) => [lang, t(`language.names.${lang}`)]),
  ) as Record<Language, string>

  return (
    <Select.Root<Language>
      value={current}
      items={items}
      onValueChange={(value) => {
        if (isLanguage(value)) void i18n.changeLanguage(value)
      }}
    >
      <Select.Trigger
        className={triggerClass}
        aria-label={t('language.label')}
        data-testid="language-switcher"
      >
        <GlobeIcon size={16} />
        <Select.Value />
        <Select.Icon>
          <ChevronDownIcon size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} align="end" className="z-50">
          <Select.Popup className={popupClass}>
            <Select.List>
              {LANGUAGES.map((lang) => (
                <Select.Item key={lang} value={lang} className={itemClass} lang={lang}>
                  {/* Always occupies the first grid column, even when ItemIndicator is unmounted. */}
                  <span className="flex w-4 items-center justify-center" aria-hidden="true">
                    <Select.ItemIndicator>
                      <CheckIcon size={14} />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>{items[lang]}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
