/** One entry in the record book. `null` means the field has not been recorded yet. */
export interface PlantRecord {
  record_no: string
  /** ISO 8601 date of the work, e.g. 2026-10-01. */
  date: string
  site: string
  /** Projects this record belongs to. Empty when it belongs to none. */
  projects: string[]
  location: string | null
  vice_county: string | null
  grid_ref: string | null
  /** Plain-text form of `name_html`. */
  name: string
  /** Name with botanical names wrapped in <i>…</i>. */
  name_html: string
  family: string
  det: string | null
  label_read: string | null
  note: string | null
  common_names: string | null
  native_range: string | null
  habit: string | null
  provenance: string | null
  diagnostic: string | null
  near_misses: string | null
  work_done: string | null
  observed: string | null
  sources: string | null
  open_questions: string | null
  powo_url: string | null
  reference_image: ReferenceImage | null
}

/** A photo of the species from a public source. It is not a photo of the plant recorded. */
export interface ReferenceImage {
  /** Path under the site root, e.g. /images/013.jpg. */
  src: string
  width: number
  height: number
  alt: string
  credit: string
  licence: string
  licence_url: string
  source: string
  source_url: string
}

export interface RecordsFile {
  schema_version: number
  title: string
  kept_by: string
  updated: string
  conventions: string
  records: PlantRecord[]
}
