import { describe, expect, it } from 'vitest'
import raw from '../../public/plant-records.json'
import { formatDate, getNeighbours, getRecords, parseRecordsFile, recordSchema } from './records'

describe('plant-records.json', () => {
  it('is valid against the schema', () => {
    expect(() => parseRecordsFile(raw)).not.toThrow()
  })

  it('has unique, zero-padded record numbers', () => {
    const nos = getRecords().map((r) => r.record_no)
    expect(new Set(nos).size).toBe(nos.length)
    for (const no of nos) expect(no).toMatch(/^\d{3,}$/)
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

<<<<<<< HEAD
  it('takes a list of projects and rejects repeats', () => {
    expect(recordSchema.safeParse({ ...good, projects: ['A', 'B'] }).success).toBe(true)
    expect(recordSchema.safeParse({ ...good, projects: ['A', 'A'] }).success).toBe(false)
    expect(recordSchema.safeParse({ ...good, projects: null }).success).toBe(false)
  })

=======
>>>>>>> 3c80d5b0afd58b65e0f08ef397adf154aa82c565
  it('rejects duplicate record numbers', () => {
    const file = { ...raw, records: [raw.records[0], raw.records[0]] }
    expect(() => parseRecordsFile(file)).toThrow(/duplicate/)
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
