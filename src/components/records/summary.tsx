'use client'

import { useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { DayRecord, Entry, StudiedRecord, WorkedRecord } from '@/types/record'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { entryShortTitleHtml, formatDate, getPlantsForDay, isPlant } from '@/lib/records'
import { TaxonName } from './taxon-name'
import { cn } from '@/lib/utils'

interface SummaryProps {
  records: Entry[]
  /** Search and filter controls, shown as the first panel. */
  filters?: ReactNode
  /** Short note beside the filter heading, e.g. how many filters are set. */
  filtersNote?: string
  /** Show the analysis panels: work days, families, native ranges, timeline. Off on the index. */
  analysis?: boolean
  /** The family the list is filtered to, or '' for none. */
  family?: string
  /** Called with a family to filter the list to it, or '' to clear. Without it the rows are plain text. */
  onFamily?: (family: string) => void
}

type Plant = WorkedRecord | StudiedRecord

function countBy(records: Plant[], key: (r: Plant) => string): [string, Plant[]][] {
  const groups = new Map<string, Plant[]>()
  for (const r of records) groups.set(key(r), [...(groups.get(key(r)) ?? []), r])
  return [...groups.entries()]
}

/** Column headings: the name a site goes by, short enough to sit on one line. */
const SHORT_SITES: Record<string, string> = {
  'Lullingstone Castle World Garden': 'Lullingstone',
  'Shorne Woods Country Park': 'Shorne Woods',
  'Riverview Academy': 'Riverview',
  'Home collection': 'Home',
}

function shortSite(site: string): string {
  const name = site.split(',')[0]
  return SHORT_SITES[name] ?? name
}

const WIDE = '(min-width: 768px)'

function subscribeWide(onChange: () => void): () => void {
  const query = window.matchMedia(WIDE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * An accordion. On the index it holds only search and filters, closed, so the
 * index stays a plain list. On the analysis page it holds the summary views.
 */
export function Summary({ records, filters, filtersNote, analysis = false, family: selected = '', onFamily }: SummaryProps) {
  // Family only applies to plants; events and work days are left out of this view.
  const plants = records.filter(isPlant)
  const families = countBy(plants, (r) => r.family).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  )
  const most = Math.max(1, ...families.map(([, rs]) => rs.length))
  const trigger = 'label cursor-pointer py-3 hover:text-stamp hover:no-underline'

  // Work days per month, split by site: how often, and where.
  const days = records.filter((r): r is DayRecord => r.type === 'day')
  const daySites = [...new Set(days.map((d) => d.site))].sort((a, b) => a.localeCompare(b))
  const months = [...new Set(days.map((d) => d.date.slice(0, 7)))].sort()
  const count = (month: string | null, site: string | null) =>
    days.filter((d) => (!month || d.date.startsWith(month)) && (!site || d.site === site)).length

  // Newest first: each work day that has plants, with the plants worked with on it.
  const timeline = days
    .map((day) => ({ day, worked: getPlantsForDay(day, records) }))
    .filter((t) => t.worked.length > 0)
    .sort((a, b) => b.day.date.localeCompare(a.day.date))

  // On the index, search and filter start open from 768px, where they fit in two rows,
  // and closed on a phone, where they would push the list down the screen.
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false)
  // null until the reader opens or closes a panel; then their choice stands.
  const [chosen, setOpen] = useState<string[] | null>(null)
  const open = chosen ?? (analysis ? ['days'] : wide ? ['filters'] : [])

  return (
    <Accordion className="border-y border-border" multiple={analysis} value={open} onValueChange={setOpen}>
      {filters && (
        <AccordionItem value="filters">
          <AccordionTrigger className={trigger}>
            Search and filter{filtersNote ? ` (${filtersNote})` : ''}
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4">{filters}</div>
          </AccordionContent>
        </AccordionItem>
      )}

      {analysis && days.length > 0 && (
        <AccordionItem value="days">
          <AccordionTrigger className={trigger}>
            Work days ({days.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-x-auto pb-4">
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th scope="col" className="label py-1.5 pr-3 font-semibold">Month</th>
                    {daySites.map((s) => (
                      <th key={s} scope="col" className="label py-1.5 pr-3 text-right font-semibold whitespace-nowrap">
                        <abbr title={s} className="no-underline">
                          {shortSite(s)}
                        </abbr>
                      </th>
                    ))}
                    <th scope="col" className="label py-1.5 text-right font-semibold">All</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-sm tabular-nums">
                  {months.map((m) => (
                    <tr key={m} className="border-b border-border">
                      <th scope="row" className="py-1.5 pr-3 text-left font-normal whitespace-nowrap">
                        {formatDate(`${m}-01`).replace(/^1 /, '')}
                      </th>
                      {daySites.map((s) => (
                        <td key={s} className="py-1.5 pr-3 text-right">{count(m, s)}</td>
                      ))}
                      <td className="py-1.5 text-right">{count(m, null)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <th scope="row" className="py-1.5 pr-3 text-left">Total</th>
                    {daySites.map((s) => (
                      <td key={s} className="py-1.5 pr-3 text-right">{count(null, s)}</td>
                    ))}
                    <td className="py-1.5 text-right">{days.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {analysis && (
      <AccordionItem value="family">
        <AccordionTrigger className={trigger}>
          By family ({families.length})
        </AccordionTrigger>
        <AccordionContent>
          <ul className="grid gap-0.5 pb-4 text-base">
            {families.map(([family, rs]) => {
              const row = (
                <>
                  <span className="truncate">{family}</span>
                  <span className="h-2 bg-secondary" aria-hidden="true">
                    <span className="block h-2 bg-stamp" style={{ width: `${(rs.length / most) * 100}%` }} />
                  </span>
                  <span className="text-right font-sans text-sm tabular-nums">{rs.length}</span>
                </>
              )
              const grid = 'grid grid-cols-[9.5rem_1fr_1.5rem] items-center gap-2'
              return (
                <li key={family}>
                  {onFamily ? (
                    <button
                      type="button"
                      aria-pressed={selected === family}
                      onClick={() => onFamily(selected === family ? '' : family)}
                      className={cn(
                        grid,
                        'min-h-9 w-full cursor-pointer text-left hover:text-stamp active:bg-muted',
                        selected === family && 'font-semibold text-stamp',
                      )}
                    >
                      {row}
                    </button>
                  ) : (
                    <span className={grid}>{row}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>
      )}

      {analysis && (
        <AccordionItem value="ranges">
          <AccordionTrigger className={trigger}>Native ranges ({plants.length})</AccordionTrigger>
          <AccordionContent>
            <ul className="grid gap-2 pb-4 text-base">
              {plants.map((r) => (
                <li key={r.record_no} className="grid gap-x-4 sm:grid-cols-[2fr_3fr]">
                  <Link href={`/records/${r.record_no}/`} className="hover:text-stamp">
                    <TaxonName html={entryShortTitleHtml(r)} />
                  </Link>
                  <span className="text-muted-foreground">
                    {r.native_range ? <TaxonName html={r.native_range} /> : 'Not recorded'}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {analysis && timeline.length > 0 && (
        <AccordionItem value="timeline">
          <AccordionTrigger className={trigger}>Timeline ({timeline.length} days with plants)</AccordionTrigger>
          <AccordionContent>
            <ol className="grid gap-3 pb-4 text-base">
              {timeline.map(({ day, worked }) => (
                <li key={day.record_no} className="grid gap-x-4 sm:grid-cols-[7.5rem_1fr]">
                  <Link
                    href={`/records/${day.record_no}/`}
                    className="font-sans text-sm tabular-nums text-muted-foreground hover:text-stamp"
                  >
                    <time dateTime={day.date}>{formatDate(day.date, 'short')}</time>
                  </Link>
                  <span>
                    {worked.map((r, i) => (
                      <span key={r.record_no}>
                        {i > 0 && '; '}
                        <TaxonName html={entryShortTitleHtml(r)} />
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  )
}
