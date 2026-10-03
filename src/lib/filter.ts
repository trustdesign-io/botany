import type { DayRecord, Entry, WorkedRecord } from '@/types/record'

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
  let parts: (string | null)[]
  if (r.type === 'event') parts = [r.record_no, r.title, r.organiser, r.site, ...r.species, r.note]
  else if (r.type === 'day') parts = [r.record_no, r.site, r.organisation, r.with_whom, ...r.tasks, r.note]
  else parts = [r.record_no, r.name, r.family, r.common_names, r.note]
  return fold(parts.filter(Boolean).join(' ').replace(/<\/?i>/g, ''))
}

/** A species studied, or a worked-with plant that was also studied. */
export function wasStudied(r: Entry): boolean {
  return r.type === 'studied' || (r.type === 'worked' && r.how_studied !== null)
}

export function filterRecords(records: Entry[], f: RecordFilters): Entry[] {
  const q = fold(f.q.trim())
  return records.filter((r) => {
    if (f.type && r.type !== f.type && !(f.type === 'studied' && wasStudied(r))) return false
    if (f.site && r.site !== f.site) return false
    if (f.project && !r.projects.includes(f.project)) return false
    if (f.family && (!('family' in r) || r.family !== f.family)) return false
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

/** One row of the index, or a work day with the plants worked with that day beneath it. */
export interface Block {
  entry: Entry
  /** Plants worked with on this day. Empty unless `entry` is a work day. */
  plants: WorkedRecord[]
}

/**
 * Groups the matched entries for the mixed list: each work day becomes one block
 * holding its matched plants, so a visit is not shown twice. A day appears when it
 * matched itself or when any of its plants did. Newest first.
 */
export function buildBlocks(matched: Entry[], all: Entry[]): Block[] {
  const days = all.filter((r): r is DayRecord => r.type === 'day')
  const dayOf = (r: WorkedRecord) => days.find((d) => d.date === r.date && d.site === r.site)
  const matchedNos = new Set(matched.map((r) => r.record_no))

  const byDay = new Map<string, WorkedRecord[]>()
  const blocks: Block[] = []
  for (const r of matched) {
    const day = r.type === 'worked' ? dayOf(r) : undefined
    if (r.type === 'worked' && day) byDay.set(day.record_no, [...(byDay.get(day.record_no) ?? []), r])
    else if (r.type !== 'day') blocks.push({ entry: r, plants: [] })
  }
  for (const day of days) {
    const plants = byDay.get(day.record_no) ?? []
    if (matchedNos.has(day.record_no) || plants.length > 0) {
      blocks.push({ entry: day, plants: plants.sort((a, b) => a.record_no.localeCompare(b.record_no)) })
    }
  }
  return blocks.sort(
    (a, b) => b.entry.date.localeCompare(a.entry.date) || b.entry.record_no.localeCompare(a.entry.record_no),
  )
}
