import { useTranslation } from 'react-i18next'

import { CATEGORIES, type Category } from '../../../lib/categories'
import { cx } from '../../../lib/cx'
import { Text } from '../../atoms'
import { CATEGORY_ICONS } from './categoryIcons'

export interface CategoryNavProps {
  /** Vertical list for the sidebar, or a wrapping chip row for narrow screens. */
  variant: 'list' | 'chips'
  /** The currently submitted query; a category is active when its query matches exactly. */
  activeQuery: string
  onSelect: (category: Category) => void
}

const itemBase =
  'inline-flex items-center gap-2 rounded-md border text-sm transition-colors focus-visible:outline-2'
const itemIdle = 'border-transparent text-text hover:bg-surface-muted'
const itemActive = 'border-accent bg-accent text-accent-text'

export function CategoryNav({ variant, activeQuery, onSelect }: CategoryNavProps) {
  const { t } = useTranslation()
  const isList = variant === 'list'
  return (
    <nav aria-label={t('category.title')} data-testid={`category-nav-${variant}`}>
      {isList ? (
        <Text variant="muted" className="mb-2 text-xs font-semibold tracking-wide uppercase">
          {t('category.title')}
        </Text>
      ) : null}
      <ul className={cx('flex gap-1', isList ? 'flex-col' : 'flex-wrap')}>
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id]
          const active = category.query === activeQuery
          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onSelect(category)}
                aria-current={active ? 'true' : undefined}
                className={cx(
                  itemBase,
                  active ? itemActive : itemIdle,
                  isList ? 'w-full px-3 py-2' : 'px-3 py-1.5',
                )}
                data-testid="category-item"
                data-category={category.id}
              >
                <Icon size={16} className="shrink-0" />
                {t(`category.${category.id}`)}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
