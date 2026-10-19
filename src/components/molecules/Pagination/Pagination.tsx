import { useTranslation } from 'react-i18next'

import { cx } from '../../../lib/cx'
import { Button, ChevronLeftIcon, ChevronRightIcon } from '../../atoms'
import { pageRange } from './pageRange'

export interface PaginationProps {
  page: number
  totalPages: number
  disabled?: boolean
  onPageChange: (page: number) => void
}

const numberBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors'
const numberIdle = 'text-text hover:bg-surface-muted'
/* Current page: accent background and white text, unchanged on hover. */
const numberCurrent = 'bg-accent text-accent-text'

export function Pagination({ page, totalPages, disabled = false, onPageChange }: PaginationProps) {
  const { t } = useTranslation()
  const hasPrevious = page > 1
  const hasNext = page < totalPages

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="pagination">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || !hasPrevious}
        onClick={() => onPageChange(page - 1)}
        data-testid="page-previous"
      >
        <ChevronLeftIcon size={16} />
        {t('search.pagination.previous')}
      </Button>

      {pageRange(page, totalPages).map((item, index) =>
        item === 'gap' ? (
          <span key={`gap-${String(index)}`} className="text-text-muted px-1" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={cx(numberBase, item === page ? numberCurrent : numberIdle)}
            aria-label={t('search.pagination.page', { page: item, total: totalPages })}
            aria-current={item === page ? 'page' : undefined}
            disabled={disabled || item === page}
            onClick={() => onPageChange(item)}
            data-testid={item === page ? 'page-current' : 'page-link'}
          >
            {item}
          </button>
        ),
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || !hasNext}
        onClick={() => onPageChange(page + 1)}
        data-testid="page-next"
      >
        {t('search.pagination.next')}
        <ChevronRightIcon size={16} />
      </Button>
    </nav>
  )
}
