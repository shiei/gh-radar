import { describe, expect, it } from 'vitest'

import en from './en.json'
import ja from './ja.json'
import zh from './zh.json'

function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    flattenKeys(value, prefix ? `${prefix}.${key}` : key),
  )
}

describe('locale files', () => {
  const enKeys = flattenKeys(en).sort()

  it.each([
    ['ja', ja],
    ['zh', zh],
  ])('%s has exactly the same keys as en', (_name, resource) => {
    expect(flattenKeys(resource).sort()).toEqual(enKeys)
  })

  it('has no empty strings', () => {
    for (const resource of [en, ja, zh]) {
      const values = JSON.stringify(resource).match(/:""/g)
      expect(values).toBeNull()
    }
  })
})
