/** 12800 -> "12.8K" (en), "1.3万" (zh/ja). */
export function formatCompactNumber(value: number, lang: string): string {
  return new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}

/** 120000 -> "120,000" (en). */
export function formatNumber(value: number, lang: string): string {
  return new Intl.NumberFormat(lang).format(value)
}
