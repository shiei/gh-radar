import { describe, expect, it, vi } from 'vitest'

import { createConsentStore, type ConsentStorage } from './consentStore'

function memoryStorage(
  initial: Record<string, string> = {},
): ConsentStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

describe('createConsentStore', () => {
  it('starts from the stored decision and ignores garbage', () => {
    expect(createConsentStore(memoryStorage({ 'osr.consent': 'granted' })).get()).toBe('granted')
    expect(createConsentStore(memoryStorage({ 'osr.consent': 'denied' })).get()).toBe('denied')
    expect(createConsentStore(memoryStorage({ 'osr.consent': 'yes' })).get()).toBeNull()
    expect(createConsentStore(memoryStorage()).get()).toBeNull()
    expect(createConsentStore(null).get()).toBeNull()
  })

  it('persists changes, removes the key on reset, and notifies subscribers once per change', () => {
    const storage = memoryStorage()
    const store = createConsentStore(storage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.set('granted')
    expect(storage.data.get('osr.consent')).toBe('granted')
    store.set('granted')
    expect(listener).toHaveBeenCalledTimes(1)

    store.set(null)
    expect(storage.data.has('osr.consent')).toBe(false)
    expect(store.get()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    store.set('denied')
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('keeps working in memory when storage throws', () => {
    const broken: ConsentStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    const store = createConsentStore(broken)
    expect(store.get()).toBeNull()
    store.set('granted')
    expect(store.get()).toBe('granted')
  })
})
