import { z } from 'zod'
import data from '../../public/plant-records.json'
import type { Entry, EntryType, EventKind, RecordsFile, StudiedRecord, WorkedRecord } from '@/types/record'

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

const imagePath = z.string().regex(/^\/images\/[\w.-]+\.(jpg|jpeg|png|webp)$/, 'must be /images/<file>')

const imageSchema = z
  .strictObject({
    kind: z.enum(['own', 'reference']),
    src: imagePath,
    thumb: imagePath,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().min(1),
    credit: z.string().min(1),
    licence: z.string().min(1).nullable(),
    licence_url: z.url().nullable(),
    source: z.string().min(1).nullable(),
    source_url: z.url().nullable(),
    taken: isoDate.nullable(),
  })
  .refine(
    (i) => i.kind === 'own' || Boolean(i.licence && i.licence_url && i.source && i.source_url),
    'a reference image needs a licence, licence_url, source and source_url',
  )

const base = {
  date: isoDate,
  projects: z.array(inlineText).refine((p) => new Set(p).size === p.length, 'duplicate project'),
  note: optionalText,
  sources: optionalText,
  open_questions: optionalText,
  image: imageSchema.nullable(),
}

const plantFields = {
  name: z.string().min(1),
  name_html: inlineText,
  family: inlineText,
  common_names: optionalText,
  native_range: optionalText,
  habit: optionalText,
  diagnostic: optionalText,
  near_misses: optionalText,
  observed: optionalText,
  powo_url: z.string().startsWith('https://powo.science.kew.org/').nullable(),
}

const workedSchema = z.strictObject({
  record_no: z.string().regex(/^\d{3,}$/, 'a worked-with record_no is zero-padded digits, e.g. 013'),
  type: z.literal('worked'),
  ...base,
  ...plantFields,
  site: inlineText,
  location: optionalText,
  vice_county: optionalText,
  grid_ref: optionalText,
  det: optionalText,
  label_read: optionalText,
  provenance: optionalText,
  work_done: optionalText,
})

const studiedSchema = z.strictObject({
  record_no: z.string().regex(/^S\d{3,}$/, 'a studied record_no is S and zero-padded digits, e.g. S001'),
  type: z.literal('studied'),
  ...base,
  ...plantFields,
  site: optionalText,
  how_studied: optionalText,
})

const eventSchema = z.strictObject({
  record_no: z.string().regex(/^E\d{3,}$/, 'an event record_no is E and zero-padded digits, e.g. E001'),
  type: z.literal('event'),
  ...base,
  title: inlineText,
  event_kind: z.enum(['lecture', 'visit', 'course', 'other']),
  site: inlineText,
  organiser: optionalText,
  notes: optionalText,
  species: z.array(inlineText),
  url: z.url().nullable(),
})

export const recordSchema = z.discriminatedUnion('type', [workedSchema, studiedSchema, eventSchema])

export const recordsFileSchema = z
  .strictObject({
    schema_version: z.literal(5),
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
      if (r.type !== 'event' && stripTags(r.name_html) !== r.name) {
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
export function getRecords(): Entry[] {
  return [...file.records].sort(
    (a, b) => a.date.localeCompare(b.date) || a.record_no.localeCompare(b.record_no),
  )
}

export function getRecord(no: string): Entry | undefined {
  return file.records.find((r) => r.record_no === no)
}

/** The entries before and after this one, within its own type, so each sequence reads cleanly. */
export function getNeighbours(no: string): { previous?: Entry; next?: Entry } {
  const self = getRecord(no)
  const all = getRecords().filter((r) => r.type === self?.type)
  const i = all.findIndex((r) => r.record_no === no)
  return { previous: all[i - 1], next: all[i + 1] }
}

export const TYPE_LABELS: Record<EntryType, string> = {
  worked: 'Worked with',
  studied: 'Studied',
  event: 'Event',
}

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  lecture: 'Lecture',
  visit: 'Visit',
  course: 'Course',
  other: 'Event',
}

export function isPlant(r: Entry): r is WorkedRecord | StudiedRecord {
  return r.type !== 'event'
}

/** What an entry is called: the plant name, or the event title. May contain <i> tags. */
export function entryTitleHtml(r: Entry): string {
  return isPlant(r) ? r.name_html : r.title
}

export function entryTitle(r: Entry): string {
  return stripTags(entryTitleHtml(r))
}

/** The title without the authority, for tight spaces: "<i>Ribes speciosum</i>". */
export function entryShortTitleHtml(r: Entry): string {
  return isPlant(r) ? r.name_html.replace(/<\/i>.*$/, '</i>') : r.title
}

/** Finds the plant entry for a species named in an event, by its binomial. */
export function findPlantByName(nameHtml: string, records: Entry[] = file.records): Entry | undefined {
  const wanted = stripTags(nameHtml).split(/\s+/).slice(0, 2).join(' ').toLowerCase()
  if (!wanted.includes(' ')) return undefined
  const matches = records.filter((r) => isPlant(r) && r.name.toLowerCase().startsWith(`${wanted}`))
  return matches.find((r) => r.type === 'worked') ?? matches[0]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** 2026-10-01 → "1 October 2026". Done by hand so server and client always agree. */
export function formatDate(iso: string, style: 'long' | 'short' = 'long'): string {
  const [y, m, d] = iso.split('-').map(Number)
  const month = MONTHS[m - 1]
  return `${d} ${style === 'short' ? month.slice(0, 3) : month} ${y}`
}
