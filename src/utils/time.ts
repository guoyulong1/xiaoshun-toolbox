export function toDateFromTimestamp(ts: number, unit: 'ms' | 's' = 'ms') {
  const ms = unit === 'ms' ? ts : ts * 1000
  return new Date(ms)
}

export function formatDate(date: Date) {
  const iso = date.toISOString()
  const local = new Intl.DateTimeFormat(undefined, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).format(date)
  return { iso, local }
}

export function parseDateInput(input: string): Date | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const d = new Date(trimmed)
  return isNaN(d.getTime()) ? null : d
}

export function nowTs() {
  const ms = Date.now()
  const s = Math.floor(ms / 1000)
  return { ms, s }
}