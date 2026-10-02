import { z } from 'zod'
import data from '../../public/plant-records.json'
import type { PlantRecord, RecordsFile } from '@/types/record'

/** Only <i>…</i> is allowed as markup, and no HTML entities. */
const inlineText = z
  .string()
  .min(1)
  .refine((s) => !/<(?!\/?i>)/.test(s), 'only <i> tags are allowed')
  .refine((s) => !/&[a-z]+;|&#\d+;/i.test(s), 'HTML entities are not allowed; use the character')
  .refine((s) => (s.match(/<i>/g) ?? []).length === (s.match(/<\/i>/g) ?? []).length, 'unbalanced <i> tags')

const optionalText = inlineText.nullable()

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), 'not a real date')

export const recordSchema = z.strictObject({
  record_no: z.string().regex(/^\d{3,}$/, 'record_no must be zero-padded digits, e.g. 013'),
  date: isoDate,
  site: inlineText,
  project: optionalText,
  location: optionalText,
  vice_county: optionalText,
  grid_ref: optionalText,
  name: z.string().min(1),
  name_html: inlineText,
  family: inlineText,
  det: optionalText,
  label_read: optionalText,
  note: optionalText,
  common_names: optionalText,
  native_range: optionalText,
  habit: optionalText,
  provenance: optionalText,
  diagnostic: optionalText,
  near_misses: optionalText,
  work_done: optionalText,
  observed: optionalText,
  sources: optionalText,
  open_questions: optionalText,
  powo_url: z.string().startsWith('https://powo.science.kew.org/').nullable(),
})

export const recordsFileSchema = z
  .strictObject({
    schema_version: z.literal(2),
    title: z.string().min(1),
    kept_by: z.string().min(1),
    updated: isoDate,
    conventions: z.string(),
    records: z.array(recordSchema).min(1),
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>()
    for (const r of file.records) {
      if (seen.has(r.record_no)) {
        ctx.addIssue({ code: 'custom', message: `duplicate record_no ${r.record_no}` })
      }
      seen.add(r.record_no)
      if (stripTags(r.name_html) !== r.name) {
        ctx.addIssue({ code: 'custom', message: `record ${r.record_no}: name does not match name_html` })
      }
    }
  })

export function stripTags(text: string): string {
  return text.replace(/<\/?i>/g, '')
}

/** Validates raw JSON. Throws with a readable message if the file is malformed. */
export function parseRecordsFile(raw: unknown): RecordsFile {
  return recordsFileSchema.parse(raw)
}

const file: RecordsFile = parseRecordsFile(data)

export function getFile(): RecordsFile {
  return file
}

/** All records, oldest first (by date, then record number). */
export function getRecords(): PlantRecord[] {
  return [...file.records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.record_no.localeCompare(b.record_no),
  )
}

export function getRecord(no: string): PlantRecord | undefined {
  return file.records.find((r) => r.record_no === no)
}

export function getNeighbours(no: string): { previous?: PlantRecord; next?: PlantRecord } {
  const all = getRecords()
  const i = all.findIndex((r) => r.record_no === no)
  return { previous: all[i - 1], next: all[i + 1] }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** 2026-10-01 → "1 October 2026". Done by hand so server and client always agree. */
export function formatDate(iso: string, style: 'long' | 'short' = 'long'): string {
  const [y, m, d] = iso.split('-').map(Number)
  const month = MONTHS[m - 1]
  return `${d} ${style === 'short' ? month.slice(0, 3) : month} ${y}`
}
