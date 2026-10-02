'use client'

import type { ReactNode } from 'react'
import type { PlantRecord } from '@/types/record'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { TaxonName } from './taxon-name'

interface SummaryProps {
  records: PlantRecord[]
  /** Search and filter controls, shown as the first panel. */
  filters?: ReactNode
  /** Short note beside the filter heading, e.g. how many filters are set. */
  filtersNote?: string
}

function countBy(records: PlantRecord[], key: (r: PlantRecord) => string): [string, PlantRecord[]][] {
  const groups = new Map<string, PlantRecord[]>()
  for (const r of records) groups.set(key(r), [...(groups.get(key(r)) ?? []), r])
  return [...groups.entries()]
}

/**
 * The index's accordion: search and filters, then summary views of all records.
 * Every panel starts closed, so the index stays a plain list.
 */
export function Summary({ records, filters, filtersNote }: SummaryProps) {
  const families = countBy(records, (r) => r.family).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  )
  const most = Math.max(...families.map(([, rs]) => rs.length))
  const trigger = 'label cursor-pointer py-3 hover:text-stamp hover:no-underline'

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

      <AccordionItem value="family">
        <AccordionTrigger className={trigger}>
          By family ({families.length})
        </AccordionTrigger>
        <AccordionContent>
          <ul className="grid gap-1.5 pb-4 text-base">
            {families.map(([family, rs]) => (
              <li key={family} className="grid grid-cols-[9.5rem_1fr_1.5rem] items-center gap-2">
                <span className="truncate">{family}</span>
                <span className="h-2 bg-secondary" aria-hidden="true">
                  <span className="block h-2 bg-stamp" style={{ width: `${(rs.length / most) * 100}%` }} />
                </span>
                <span className="text-right font-sans text-sm tabular-nums">{rs.length}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="ranges">
        <AccordionTrigger className={trigger}>
          Native ranges
        </AccordionTrigger>
        <AccordionContent>
          <ul className="grid gap-2 pb-4 text-base">
            {records.map((r) => (
              <li key={r.record_no} className="grid gap-x-4 sm:grid-cols-[2fr_3fr]">
                <TaxonName html={r.name_html.replace(/<\/i>.*$/, '</i>')} />
                <span className="text-muted-foreground">
                  {r.native_range ? <TaxonName html={r.native_range} /> : 'Not recorded'}
                </span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
