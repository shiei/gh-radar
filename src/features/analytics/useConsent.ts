import { useCallback, useSyncExternalStore } from 'react'

import { consentStore, type Consent, type ConsentStore } from '../../lib/analytics'

export interface ConsentControls {
  /** `null` until the visitor has answered. */
  consent: Consent | null
  grant: () => void
  deny: () => void
  /** Forget the answer so the banner asks again. */
  reset: () => void
}

const serverSnapshot = () => null

export function useConsent(store: ConsentStore = consentStore): ConsentControls {
  const consent = useSyncExternalStore(store.subscribe, store.get, serverSnapshot)
  const grant = useCallback(() => store.set('granted'), [store])
  const deny = useCallback(() => store.set('denied'), [store])
  const reset = useCallback(() => store.set(null), [store])
  return { consent, grant, deny, reset }
}
