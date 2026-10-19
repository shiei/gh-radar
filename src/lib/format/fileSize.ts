/** GitHub reports repository size in KB. */
export function formatKb(kb: number, lang: string): string {
  const nf = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })
  if (kb >= 1024 * 1024) return `${nf.format(kb / (1024 * 1024))} GB`
  if (kb >= 1024) return `${nf.format(kb / 1024)} MB`
  return `${nf.format(kb)} KB`
}
