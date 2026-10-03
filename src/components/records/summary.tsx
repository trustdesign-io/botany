'use client'

import type { ReactNode } from 'react'
import type { DayRecord, Entry, StudiedRecord, WorkedRecord } from '@/types/record'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { formatDate, isPlant } from '@/lib/records'
import { cn } from '@/lib/utils'

interface SummaryProps {
  records: Entry[]
  /** Search and filter controls, shown as the first panel. */
  filters?: ReactNode
  /** Short note beside the filter heading, e.g. how many filters are set. */
  filtersNote?: string
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

/**
 * The index's accordion: search and filters, then summary views of all records.
 * Every panel starts closed, so the index stays a plain list.
 */
export function Summary({ records, filters, filtersNote, family: selected = '', onFamily }: SummaryProps) {
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
  const hours = days.reduce((sum, d) => sum + (d.hours ?? 0), 0)

  return (
    <Accordion className="border-y border-border">
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

      {days.length > 0 && (
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
                      <th key={s} scope="col" className="label py-1.5 pr-3 text-right font-semibold">
                        {s.split(',')[0]}
                      </th>
                    ))}
                    <th scope="col" className="label py-1.5 text-right font-semibold">All</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-sm tabular-nums">
                  {months.map((m) => (
                    <tr key={m} className="border-b border-border">
                      <th scope="row" className="py-1.5 pr-3 text-left font-normal">
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
              {hours > 0 && (
                <p className="pt-2 font-sans text-sm text-muted-foreground">{hours} hours recorded.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

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
    </Accordion>
  )
}
