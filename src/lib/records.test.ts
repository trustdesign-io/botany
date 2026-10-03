import { describe, expect, it } from 'vitest'
import raw from '../../public/plant-records.json'
import { EVENT_EXAMPLE, STUDIED_EXAMPLE } from './fixtures'
import type { DayRecord, WorkedRecord } from '@/types/record'
import {
  getDayFor,
  getPlantsForDay,
  weekday,
  entryTitle,
  findPlantByName,
  formatDate,
  getNeighbours,
  getRecords,
  parseRecordsFile,
  recordSchema,
} from './records'

describe('plant-records.json', () => {
  it('is valid against the schema', () => {
    expect(() => parseRecordsFile(raw)).not.toThrow()
  })

  it('has unique record numbers, each in its type\'s sequence', () => {
    const all = getRecords()
    expect(new Set(all.map((r) => r.record_no)).size).toBe(all.length)
    const pattern = { worked: /^\d{3,}$/, studied: /^S\d{3,}$/, event: /^E\d{3,}$/, day: /^D\d{3,}$/ }
    for (const r of all) expect(r.record_no).toMatch(pattern[r.type])
  })

  it('sorts oldest first', () => {
    const dates = getRecords().map((r) => r.date)
    expect(dates).toEqual([...dates].sort())
  })
})

describe('schema', () => {
  const good = getRecords()[0]

  it('rejects markup other than <i>', () => {
    expect(recordSchema.safeParse({ ...good, diagnostic: '<b>bold</b>' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, diagnostic: '<script>x</script>' }).success).toBe(false)
  })

  it('rejects HTML entities and unbalanced tags', () => {
    expect(recordSchema.safeParse({ ...good, family: 'A &amp; B' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, note: '<i>Aloe' }).success).toBe(false)
  })

  it('rejects bad dates and unknown fields', () => {
    expect(recordSchema.safeParse({ ...good, date: '2 Oct 2026' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, extra: 1 }).success).toBe(false)
  })

  it('takes a list of projects and rejects repeats', () => {
    expect(recordSchema.safeParse({ ...good, projects: ['A', 'B'] }).success).toBe(true)
    expect(recordSchema.safeParse({ ...good, projects: ['A', 'A'] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, projects: null }).success).toBe(false)
  })

  const image = {
    kind: 'reference', src: '/images/001.jpg', thumb: '/images/001-thumb.jpg', width: 800, height: 600,
    alt: 'A plant', credit: 'A. Person', licence: 'CC BY 4.0',
    licence_url: 'https://creativecommons.org/licenses/by/4.0/', source: 'iNaturalist',
    source_url: 'https://www.inaturalist.org/observations/1', taken: null,
  }

  it('requires a credit, licence and source on a reference image', () => {
    expect(recordSchema.safeParse({ ...good, images: [image] }).success).toBe(true)
    expect(recordSchema.safeParse({ ...good, images: [{ ...image, credit: '' }] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, images: [{ ...image, licence: null }] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, images: [{ ...image, src: 'https://example.com/x.jpg' }] }).success).toBe(false)
  })

  it('lets an own photo go without a licence or source', () => {
    const own = { ...image, kind: 'own', credit: 'D.C. Chambers', licence: null, licence_url: null, source: null, source_url: null, taken: '2026-10-02' }
    expect(recordSchema.safeParse({ ...good, images: [own] }).success).toBe(true)
  })

  it('takes several photos, the first with a thumb, never own and reference together', () => {
    const own = { ...image, kind: 'own', credit: 'D.C. Chambers', licence: null, licence_url: null, source: null, source_url: null }
    const second = { ...own, src: '/images/001-2.jpg', thumb: null }
    expect(recordSchema.safeParse({ ...good, images: [own, second] }).success).toBe(true)
    expect(recordSchema.safeParse({ ...good, images: [second, own] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, images: [own, own] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, images: [own, { ...image, src: '/images/001-2.jpg' }] }).success).toBe(false)
  })

  it('every image file exists', async () => {
    const { existsSync } = await import('node:fs')
    for (const r of getRecords()) {
      const logged = r.type === 'worked' ? r.log.flatMap((e) => e.images) : []
      for (const image of [...r.images, ...logged]) {
        expect(existsSync(`public${image.src}`), r.record_no).toBe(true)
        if (image.thumb) expect(existsSync(`public${image.thumb}`), r.record_no).toBe(true)
      }
    }
  })

  it('takes a dated log on a worked-with plant, in date order', () => {
    const entry = { date: '2026-09-18', site: null, location: 'Terrarium at home', text: 'Planted.', images: [] }
    expect(recordSchema.safeParse({ ...good, log: [entry, { ...entry, date: '2026-09-25' }] }).success).toBe(true)
    expect(recordSchema.safeParse({ ...good, log: [{ ...entry, date: '2026-09-25' }, entry] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, log: [{ ...entry, text: '' }] }).success).toBe(false)
  })

  it('rejects duplicate record numbers', () => {
    const file = { ...raw, records: [raw.records[0], raw.records[0]] }
    expect(() => parseRecordsFile(file)).toThrow(/duplicate/)
  })
})

describe('entry types', () => {
  it('accepts a studied species and an event', () => {
    expect(recordSchema.safeParse(STUDIED_EXAMPLE).success).toBe(true)
    expect(recordSchema.safeParse(EVENT_EXAMPLE).success).toBe(true)
  })

  it('ties the number prefix to the type', () => {
    expect(recordSchema.safeParse({ ...STUDIED_EXAMPLE, record_no: '023' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...EVENT_EXAMPLE, record_no: 'S001' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...getRecords()[0], record_no: 'E001' }).success).toBe(false)
  })

  it('keeps hands-on fields off a studied species', () => {
    expect(recordSchema.safeParse({ ...STUDIED_EXAMPLE, work_done: 'Pruned' }).success).toBe(false)
  })

  it('requires a title, kind and place on an event', () => {
    expect(recordSchema.safeParse({ ...EVENT_EXAMPLE, title: '' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...EVENT_EXAMPLE, event_kind: 'party' }).success).toBe(false)
    expect(recordSchema.safeParse({ ...EVENT_EXAMPLE, site: null }).success).toBe(false)
  })

  it('titles an event by its title and a plant by its name', () => {
    expect(entryTitle(EVENT_EXAMPLE)).toBe('Example lecture on glasshouse plants')
    expect(entryTitle(STUDIED_EXAMPLE)).toBe('Amorphophallus titanum (Becc.) Becc.')
  })

  it('links a species named in an event to its record', () => {
    const all = [...getRecords(), STUDIED_EXAMPLE]
    expect(findPlantByName('<i>Ribes speciosum</i>', all)?.record_no).toBe('014')
    expect(findPlantByName('<i>Amorphophallus titanum</i>', all)?.record_no).toBe('S001')
    expect(findPlantByName('<i>Quercus robur</i>', all)).toBeUndefined()
  })
})

describe('work days', () => {
  const all = getRecords()
  const days = all.filter((r): r is DayRecord => r.type === 'day')
  const worked = all.filter((r): r is WorkedRecord => r.type === 'worked')

  it('every plant worked with belongs to a work day', () => {
    for (const r of worked) expect(getDayFor(r), r.record_no).toBeDefined()
  })

  it('lists a day\'s plants from their own records', () => {
    const oct2 = days.find((d) => d.date === '2026-10-02')
    expect(oct2 && getPlantsForDay(oct2).map((p) => p.record_no)).toEqual(['015', '016', '017', '018', '019', '020', '021', '022'])
  })

  it('has no plants on a day at another site', () => {
    const shorne = days.find((d) => d.site.startsWith('Shorne'))
    expect(shorne && getPlantsForDay(shorne)).toEqual([])
  })

  it('allows only one work day per date and site', () => {
    const file = { ...raw, records: [...raw.records, { ...days[0], record_no: 'D999' }] }
    expect(() => parseRecordsFile(file)).toThrow(/two work days/)
  })

  it('names the weekday', () => {
    expect(weekday('2026-10-02')).toBe('Friday')
    expect(weekday('2026-07-18')).toBe('Saturday')
  })
})

describe('helpers', () => {
  it('formats dates without locale APIs', () => {
    expect(formatDate('2026-10-01')).toBe('1 October 2026')
    expect(formatDate('2026-07-18', 'short')).toBe('18 Jul 2026')
  })

  it('finds neighbours within a type', () => {
    const all = getRecords().filter((r) => r.type === 'worked')
    expect(getNeighbours(all[0].record_no).previous).toBeUndefined()
    expect(getNeighbours(all[0].record_no).next?.record_no).toBe(all[1].record_no)
  })
})
