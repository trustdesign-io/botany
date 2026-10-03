/**
 * One entry in the records. Four types share one list:
 * - `worked`: a plant worked with. Numbered 001, 002…
 * - `studied`: a species investigated but not worked with. Numbered S001, S002…
 * - `event`: a lecture, visit, course or other attendance. Numbered E001, E002…
 * - `day`: a day worked at a site. Numbered D001, D002…
 * `null` means the field has not been recorded yet.
 */
export type Entry = WorkedRecord | StudiedRecord | EventRecord | DayRecord

export type EntryType = Entry['type']

export type EventKind = 'lecture' | 'visit' | 'course' | 'other'

export type Capacity = 'volunteer' | 'contract' | 'own'

interface BaseEntry {
  record_no: string
  /** ISO 8601 date, e.g. 2026-10-01. */
  date: string
  /** Projects this entry belongs to. Empty when it belongs to none. */
  projects: string[]
  note: string | null
  sources: string | null
  open_questions: string | null
  /** One photo per entry. An `own` photo replaces a `reference` one. */
  image: RecordImage | null
}

interface PlantFields {
  /** Plain-text form of `name_html`. */
  name: string
  /** Name with botanical names wrapped in <i>…</i>. */
  name_html: string
  family: string
  common_names: string | null
  native_range: string | null
  habit: string | null
  diagnostic: string | null
  near_misses: string | null
  observed: string | null
  powo_url: string | null
}

export interface WorkedRecord extends BaseEntry, PlantFields {
  type: 'worked'
  site: string
  location: string | null
  vice_county: string | null
  grid_ref: string | null
  det: string | null
  label_read: string | null
  provenance: string | null
  work_done: string | null
}

export interface StudiedRecord extends BaseEntry, PlantFields {
  type: 'studied'
  /** Where it was studied, if anywhere in particular. */
  site: string | null
  /** How it was studied: a book, a glasshouse visit, a herbarium sheet. */
  how_studied: string | null
}

export interface EventRecord extends BaseEntry {
  type: 'event'
  title: string
  event_kind: EventKind
  /** The place. */
  site: string
  organiser: string | null
  notes: string | null
  /** Species seen or covered, each with botanical names wrapped in <i>…</i>. */
  species: string[]
  url: string | null
}

/**
 * A day worked at a site. The plants worked with that day are not stored here:
 * they are the `worked` entries with the same date and site.
 */
export interface DayRecord extends BaseEntry {
  type: 'day'
  site: string
  /** Who the work was for. */
  organisation: string | null
  capacity: Capacity
  hours: number | null
  with_whom: string | null
  /** Work that did not involve a specific plant, one item each: "Watering the Australis tunnel". */
  tasks: string[]
}

/**
 * `own`: D.C. Chambers' photograph of the plant recorded.
 * `reference`: a photo of the species from a public source, not of the plant recorded;
 * it must carry a licence and a source.
 */
export interface RecordImage {
  kind: 'own' | 'reference'
  /** Path under the site root, e.g. /images/013.jpg. */
  src: string
  /** Square thumbnail for the index, e.g. /images/013-thumb.jpg. */
  thumb: string
  width: number
  height: number
  alt: string
  credit: string
  licence: string | null
  licence_url: string | null
  source: string | null
  source_url: string | null
  /** ISO date the photo was taken, when known. */
  taken: string | null
}

export interface RecordsFile {
  schema_version: number
  title: string
  kept_by: string
  updated: string
  conventions: string
  records: Entry[]
}
