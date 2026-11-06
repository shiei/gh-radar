/** Google Analytics 4 measurement ID. Public by nature: it ends up in the served HTML anyway. */
export const GA_MEASUREMENT_ID = 'G-50GCM2160X'

/** localStorage key for the visitor's cookie decision. */
export const CONSENT_STORAGE_KEY = 'osr.consent'

export const CONSENT_VALUES = ['granted', 'denied'] as const
export type Consent = (typeof CONSENT_VALUES)[number]

export function isConsent(value: unknown): value is Consent {
  return typeof value === 'string' && (CONSENT_VALUES as readonly string[]).includes(value)
}
