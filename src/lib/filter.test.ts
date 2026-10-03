import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS, buildBlocks, filterRecords, filtersToHash, hashToFilters, uniqueSorted } from './filter'
import { EVENT_EXAMPLE, STUDIED_EXAMPLE } from './fixtures'
import { getRecords } from './records'

const all = getRecords()
const records = all.filter((r) => r.type === 'worked')

describe('filterRecords', () => {
  it('returns everything with no filters', () => {
    expect(filterRecords(records, EMPTY_FILTERS)).toHaveLength(records.length)
  })

  it('searches names, ignoring case and accents', () => {
    const found = filterRecords(records, { ...EMPTY_FILTERS, q: 'RIBES' })
    expect(found.map((r) => r.record_no)).toEqual(['014'])
    expect(filterRecords(records, { ...EMPTY_FILTERS, q: 'pohuehue' })).toHaveLength(1)
  })

  it('filters by family and date range', () => {
    const brom = filterRecords(records, { ...EMPTY_FILTERS, family: 'Bromeliaceae' })
    expect(brom.map((r) => r.record_no)).toEqual(['009', '017'])
    const oct = filterRecords(records, { ...EMPTY_FILTERS, from: '2026-10-01', to: '2026-10-01' })
    expect(oct.map((r) => r.record_no)).toEqual(['013', '014'])
  })

  it('returns nothing for an unknown site', () => {
    expect(filterRecords(records, { ...EMPTY_FILTERS, site: 'Nowhere' })).toHaveLength(0)
  })
})

describe('projects', () => {
  const [a, b, ...rest] = records
  const withProjects = [
    { ...a, projects: ['Nesocodon accession', 'Lullingstone volunteering'] },
    { ...b, projects: ['Lullingstone volunteering'] },
    ...rest,
  ]

  it('matches a record under each of its projects, once', () => {
    const lull = filterRecords(withProjects, { ...EMPTY_FILTERS, project: 'Lullingstone volunteering' })
    expect(lull.map((r) => r.record_no)).toEqual([a.record_no, b.record_no])
    const neso = filterRecords(withProjects, { ...EMPTY_FILTERS, project: 'Nesocodon accession' })
    expect(neso.map((r) => r.record_no)).toEqual([a.record_no])
  })

  it('lists each project once for the filter', () => {
    expect(uniqueSorted(withProjects.flatMap((r) => r.projects))).toEqual([
      'Lullingstone volunteering',
      'Nesocodon accession',
    ])
  })
})

describe('types', () => {
  const mixed = [...records, STUDIED_EXAMPLE, EVENT_EXAMPLE]

  it('filters to one type, giving that type\'s own sequence', () => {
    expect(filterRecords(mixed, { ...EMPTY_FILTERS, type: 'worked' })).toHaveLength(records.length)
    expect(filterRecords(mixed, { ...EMPTY_FILTERS, type: 'studied' }).map((r) => r.record_no)).toEqual(['S001'])
    expect(filterRecords(mixed, { ...EMPTY_FILTERS, type: 'event' }).map((r) => r.record_no)).toEqual(['E001'])
  })

  it('searches event titles and the species they list', () => {
    expect(filterRecords(mixed, { ...EMPTY_FILTERS, q: 'lecture' }).map((r) => r.record_no)).toEqual(['E001'])
    expect(filterRecords(mixed, { ...EMPTY_FILTERS, q: 'titanum' }).map((r) => r.record_no)).toEqual(['S001', 'E001'])
  })

  it('leaves events out when filtering by family', () => {
    const found = filterRecords(mixed, { ...EMPTY_FILTERS, family: 'Araceae' })
    expect(found.map((r) => r.record_no)).toEqual(['S001'])
  })
})

describe('work days', () => {
  it('filters to work days and by site', () => {
    const days = filterRecords(all, { ...EMPTY_FILTERS, type: 'day' })
    expect(days).toHaveLength(19)
    const shorne = filterRecords(all, { ...EMPTY_FILTERS, type: 'day', site: 'Shorne Woods Country Park, Kent' })
    expect(shorne).toHaveLength(6)
  })

  it('keeps the worked-with list clean', () => {
    const worked = filterRecords(all, { ...EMPTY_FILTERS, type: 'worked' })
    expect(worked.every((r) => r.type === 'worked')).toBe(true)
    expect(worked).toHaveLength(all.filter((r) => r.type === 'worked').length)
  })
})

describe('studied filter', () => {
  it('shows studied species and worked-with plants that were also studied', () => {
    const worked = all.find((r) => r.type === 'worked')
    if (!worked || worked.type !== 'worked') throw new Error('no worked record')
    const both = { ...worked, record_no: '999', how_studied: 'Keyed out with Stace.' }
    const got = filterRecords([worked, both], { ...EMPTY_FILTERS, type: 'studied' })
    expect(got.map((r) => r.record_no)).toEqual(['999'])
    expect(filterRecords([worked, both], { ...EMPTY_FILTERS, type: 'worked' })).toHaveLength(2)
  })
})

describe('buildBlocks', () => {
  it('puts each plant under its work day, so a visit appears once', () => {
    const blocks = buildBlocks(all, all)
    expect(blocks.filter((b) => b.entry.type === 'worked')).toHaveLength(0)
    expect(blocks.filter((b) => b.entry.type === 'day')).toHaveLength(19)
    const oct2 = blocks.find((b) => b.entry.date === '2026-10-02')
    expect(oct2?.plants.map((p) => p.record_no)).toEqual(['015', '016', '017', '018', '019', '020', '021', '022'])
    expect(blocks.reduce((n, b) => n + b.plants.length, 0)).toBe(all.filter((r) => r.type === 'worked').length)
  })

  it('is newest first', () => {
    const dates = buildBlocks(all, all).map((b) => b.entry.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('shows only the days that hold a match, with only the matching plants', () => {
    const matched = filterRecords(all, { ...EMPTY_FILTERS, q: 'ribes' })
    const blocks = buildBlocks(matched, all)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].entry.date).toBe('2026-10-01')
    expect(blocks[0].plants.map((p) => p.record_no)).toEqual(['014'])
  })

  it('keeps studied species and events as rows of their own', () => {
    const blocks = buildBlocks([STUDIED_EXAMPLE, EVENT_EXAMPLE], all)
    expect(blocks.map((b) => b.entry.record_no).sort()).toEqual(['E001', 'S001'])
  })
})

describe('hash round trip', () => {
  it('survives encoding', () => {
    const f = { ...EMPTY_FILTERS, q: 'aloe vera', family: 'Asphodelaceae' }
    expect(hashToFilters(filtersToHash(f))).toEqual(f)
  })

  it('is empty when no filters are set', () => {
    expect(filtersToHash(EMPTY_FILTERS)).toBe('')
    expect(hashToFilters('')).toEqual(EMPTY_FILTERS)
  })
})

describe('uniqueSorted', () => {
  it('drops nulls and duplicates', () => {
    expect(uniqueSorted(['b', null, 'a', 'b'])).toEqual(['a', 'b'])
  })
})
