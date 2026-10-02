import type { PlantRecord } from '@/types/record'

export interface RecordFilters {
  q: string
  site: string
  project: string
  family: string
  from: string
  to: string
}

export const EMPTY_FILTERS: RecordFilters = { q: '', site: '', project: '', family: '', from: '', to: '' }

const KEYS = Object.keys(EMPTY_FILTERS) as (keyof RecordFilters)[]

function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function filterRecords(records: PlantRecord[], f: RecordFilters): PlantRecord[] {
  const q = fold(f.q.trim())
  return records.filter((r) => {
    if (f.site && r.site !== f.site) return false
    if (f.project && !r.projects.includes(f.project)) return false
    if (f.family && r.family !== f.family) return false
    if (f.from && r.date < f.from) return false
    if (f.to && r.date > f.to) return false
    if (!q) return true
    const haystack = fold([r.record_no, r.name, r.family, r.common_names ?? '', r.note ?? ''].join(' '))
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
