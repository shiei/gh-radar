import { Popover } from '@base-ui-components/react/popover'
import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { cx } from '../../../lib/cx'
import {
  clearToken,
  getRateLimit,
  getTokenState,
  setRateLimit,
  setToken,
  subscribeRateLimit,
  subscribeToken,
  validateToken,
} from '../../../lib/github'
import {
  Button,
  ExternalLinkIcon,
  InfoIcon,
  Input,
  KeyIcon,
  RadarSpinner,
  Text,
  Tooltip,
} from '../../atoms'

export const CREATE_TOKEN_URL =
  'https://github.com/settings/personal-access-tokens/new?description=OpenSource%20Radar%20(read-only)'

type SaveStatus = 'idle' | 'checking' | 'invalid' | 'failed'

const triggerClass =
  'inline-flex h-9 items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm whitespace-nowrap text-text transition-colors hover:bg-surface-muted'
const popupClass =
  'w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface-raised p-4 shadow-lg outline-none'

/** Header entry for the personal token: shows quota when set, opens a popover to manage it. */
export function TokenMenu() {
  const { t } = useTranslation()
  const { token, remembered } = useSyncExternalStore(subscribeToken, getTokenState)
  const [remember, setRemember] = useState(false)
  const quota = useSyncExternalStore(subscribeRateLimit, getRateLimit)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')

  const label = !token
    ? t('token.connect')
    : quota
      ? quota.limit === null
        ? t('token.quotaUnknownLimit', { remaining: quota.remaining })
        : t('token.quota', { remaining: quota.remaining, limit: quota.limit })
      : t('token.connected')

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const candidate = value.trim()
    if (!candidate || status === 'checking') return
    setStatus('checking')
    const result = await validateToken(candidate)
    if (result.ok) {
      // setToken resets the quota to unknown; restore what the validation just learned.
      setToken(candidate, { remember })
      setRateLimit(result.data)
      setValue('')
      setStatus('idle')
      setOpen(false)
      return
    }
    setStatus(result.error.kind === 'invalid_token' ? 'invalid' : 'failed')
  }

  const handleRemove = () => {
    clearToken()
    setValue('')
    setStatus('idle')
    setOpen(false)
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setStatus('idle')
        }}
      >
        <Popover.Trigger
          className={cx(triggerClass, token && 'text-accent')}
          aria-label={t('token.title')}
          data-testid="token-trigger"
          data-token-state={token ? 'set' : 'none'}
        >
          <KeyIcon size={16} />
          <span data-testid="token-label">{label}</span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8} align="end" className="z-50">
            <Popover.Popup className={popupClass} data-testid="token-popup">
              <form onSubmit={(event) => void handleSave(event)} className="flex flex-col gap-3">
                <Popover.Title className="text-text text-sm font-semibold">
                  {t('token.title')}
                </Popover.Title>
                <Popover.Description className="text-text-muted text-xs leading-relaxed">
                  {t('token.description')}
                </Popover.Description>
                <a
                  href={CREATE_TOKEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent inline-flex items-center gap-1 text-xs hover:underline"
                >
                  {t('token.createLink')}
                  <ExternalLinkIcon size={11} />
                </a>
                <Text
                  variant="muted"
                  className="text-xs font-semibold"
                  data-testid="token-least-privilege"
                >
                  {t('token.leastPrivilege')}
                </Text>
                {token ? (
                  <Text variant="muted" className="text-xs" data-testid="token-status">
                    {t(remembered ? 'token.remembered' : 'token.status')}
                  </Text>
                ) : null}
                <Input
                  type="password"
                  autoComplete="off"
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value)
                    if (status !== 'checking') setStatus('idle')
                  }}
                  placeholder={t('token.placeholder')}
                  aria-label={t('token.placeholder')}
                  className="h-9 text-sm"
                  data-testid="token-input"
                />
                <label className="text-text flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="accent-accent mt-0.5"
                    data-testid="token-remember"
                  />
                  <span>
                    {t('token.remember')}
                    <span className="text-text-muted mt-0.5 block">{t('token.rememberHint')}</span>
                  </span>
                </label>
                {status === 'invalid' || status === 'failed' ? (
                  <Text
                    variant="body"
                    className="text-danger text-xs"
                    role="alert"
                    data-testid="token-error"
                  >
                    {t(status === 'invalid' ? 'token.invalid' : 'token.failed')}
                  </Text>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  {token ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      data-testid="token-remove"
                    >
                      {t('token.remove')}
                    </Button>
                  ) : (
                    <span />
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={status === 'checking' || !value.trim()}
                    data-testid="token-save"
                  >
                    {status === 'checking' ? <RadarSpinner size={14} /> : null}
                    {t(status === 'checking' ? 'token.checking' : 'token.save')}
                  </Button>
                </div>
              </form>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {/* Separate hover target so the button itself stays unambiguous: click = configure. */}
      <Tooltip content={t('token.quotaHelp')}>
        <span className="text-text-muted inline-flex" data-testid="quota-help-trigger">
          <InfoIcon size={14} />
        </span>
      </Tooltip>
    </span>
  )
}
