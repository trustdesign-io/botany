import type { EventRecord, StudiedRecord } from '@/types/record'

/** Example entries for stories and tests only. They are not real records and never ship in the data file. */
export const STUDIED_EXAMPLE: StudiedRecord = {
  record_no: 'S001',
  type: 'studied',
  date: '2026-09-12',
  projects: [],
  site: 'Example Botanic Garden',
  name: 'Amorphophallus titanum (Becc.) Becc.',
  name_html: '<i>Amorphophallus titanum</i> (Becc.) Becc.',
  family: 'Araceae',
  how_studied: 'Example: seen in flower in a glasshouse, then read up afterwards.',
  note: null,
  common_names: 'Titan arum',
  native_range: 'W. Sumatera',
  habit: 'Tuberous geophyte; wet tropical biome',
  diagnostic: 'Example diagnostic text.',
  near_misses: null,
  observed: null,
  sources: 'Example source.',
  open_questions: null,
  powo_url: null,
  images: [],
}

export const EVENT_EXAMPLE: EventRecord = {
  record_no: 'E001',
  type: 'event',
  date: '2026-09-20',
  projects: [],
  title: 'Example lecture on glasshouse plants',
  event_kind: 'lecture',
  site: 'Example Hall, London',
  organiser: 'Example Society',
  notes: 'Example notes on what the lecture covered.',
  species: ['<i>Ribes speciosum</i>', '<i>Amorphophallus titanum</i>'],
  url: 'https://example.org/lecture',
  note: null,
  sources: null,
  open_questions: null,
  images: [],
}
