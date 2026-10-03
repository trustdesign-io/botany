import type { Entry } from '@/types/record'

export interface RecordFilters {
  q: string
  type: string
  site: string
  project: string
  family: string
  from: string
  to: string
}

export const EMPTY_FILTERS: RecordFilters = { q: '', type: '', site: '', project: '', family: '', from: '', to: '' }

const KEYS = Object.keys(EMPTY_FILTERS) as (keyof RecordFilters)[]

function fold(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/** The text a search looks through for one entry. */
function searchText(r: Entry): string {
  const parts: (string | null)[] =
    r.type === 'event'
      ? [r.record_no, r.title, r.organiser, r.site, ...r.species, r.note]
      : [r.record_no, r.name, r.family, r.common_names, r.note]
  return fold(parts.filter(Boolean).join(' ').replace(/<\/?i>/g, ''))
}

export function filterRecords(records: Entry[], f: RecordFilters): Entry[] {
  const q = fold(f.q.trim())
  return records.filter((r) => {
    if (f.type && r.type !== f.type) return false
    if (f.site && r.site !== f.site) return false
    if (f.project && !r.projects.includes(f.project)) return false
    if (f.family && (r.type === 'event' || r.family !== f.family)) return false
    if (f.from && r.date < f.from) return false
    if (f.to && r.date > f.to) return false
    if (!q) return true
    const haystack = searchText(r)
    return q.split(/\s+/).every((word) => haystack.includes(word))
  })
}

/** Filters ↔ URL hash, so a filtered view can be shared. Empty values are left out. */
export function filtersToHash(f: RecordFilters): string {
  const params = new URLSearchParams()
  for (const k of KEYS) if (f[k]) params.set(k, f[k])
  const s = params.toString()
  return s ? `#${s}` : ''
}

export function hashToFilters(hash: string): RecordFilters {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const out = { ...EMPTY_FILTERS }
  for (const k of KEYS) out[k] = params.get(k) ?? ''
  return out
}

export function uniqueSorted(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b))
}
