/** Hour and minute in the viewer's locale, e.g. "14:32" / "2:32 PM". */
export function formatTime(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' }).format(date)
}
