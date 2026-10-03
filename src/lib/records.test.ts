import { describe, expect, it } from 'vitest'
import raw from '../../public/plant-records.json'
import { EVENT_EXAMPLE, STUDIED_EXAMPLE } from './fixtures'
import {
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
    const pattern = { worked: /^\d{3,}$/, studied: /^S\d{3,}$/, event: /^E\d{3,}$/ }
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
    expect(recordSchema.safeParse({ ...good, image }).success).toBe(true)
    expect(recordSchema.safeParse({ ...good, image: { ...image, credit: '' } }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, image: { ...image, licence: null } }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, image: { ...image, src: 'https://example.com/x.jpg' } }).success).toBe(false)
  })

  it('lets an own photo go without a licence or source', () => {
    const own = { ...image, kind: 'own', credit: 'D.C. Chambers', licence: null, licence_url: null, source: null, source_url: null, taken: '2026-10-02' }
    expect(recordSchema.safeParse({ ...good, image: own }).success).toBe(true)
  })

  it('every image file exists', async () => {
    const { existsSync } = await import('node:fs')
    for (const r of getRecords()) {
      if (!r.image) continue
      expect(existsSync(`public${r.image.src}`), r.record_no).toBe(true)
      expect(existsSync(`public${r.image.thumb}`), r.record_no).toBe(true)
    }
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
    expect(findPlantByName('<i>Ribes speciosum</i>', all)?.record_no).toBe('013')
    expect(findPlantByName('<i>Amorphophallus titanum</i>', all)?.record_no).toBe('S001')
    expect(findPlantByName('<i>Quercus robur</i>', all)).toBeUndefined()
  })
})

describe('helpers', () => {
  it('formats dates without locale APIs', () => {
    expect(formatDate('2026-10-01')).toBe('1 October 2026')
    expect(formatDate('2026-07-18', 'short')).toBe('18 Jul 2026')
  })

  it('finds neighbours', () => {
    const all = getRecords()
    expect(getNeighbours(all[0].record_no).previous).toBeUndefined()
    expect(getNeighbours(all[0].record_no).next?.record_no).toBe(all[1].record_no)
  })
})
