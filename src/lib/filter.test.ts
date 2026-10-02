import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS, filterRecords, filtersToHash, hashToFilters, uniqueSorted } from './filter'
import { getRecords } from './records'

const records = getRecords()

describe('filterRecords', () => {
  it('returns everything with no filters', () => {
    expect(filterRecords(records, EMPTY_FILTERS)).toHaveLength(records.length)
  })

  it('searches names, ignoring case and accents', () => {
    const found = filterRecords(records, { ...EMPTY_FILTERS, q: 'RIBES' })
    expect(found.map((r) => r.record_no)).toEqual(['013'])
    expect(filterRecords(records, { ...EMPTY_FILTERS, q: 'pohuehue' })).toHaveLength(1)
  })

  it('filters by family and date range', () => {
    const brom = filterRecords(records, { ...EMPTY_FILTERS, family: 'Bromeliaceae' })
    expect(brom.map((r) => r.record_no)).toEqual(['010', '020'])
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
