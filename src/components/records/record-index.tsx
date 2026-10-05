'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Entry } from '@/types/record'
import {
  type Block,
  EMPTY_FILTERS,
  type RecordFilters,
  buildBlocks,
  filterRecords,
  filtersToHash,
  uniqueSorted,
} from '@/lib/filter'
import {
  CAPACITY_LABELS,
  EVENT_KIND_LABELS,
  TYPE_LABELS,
  entryTitleHtml,
  formatDate,
  isPlant,
} from '@/lib/records'
import { BASE_PATH } from '@/lib/site'
import { cn } from '@/lib/utils'
import { useHashFilters } from '@/hooks/use-hash-filters'
import { Summary } from './summary'
import { TaxonName } from './taxon-name'

interface RecordIndexProps {
  /** All records, oldest first. */
  records: Entry[]
}

const control =
  'h-10 w-full min-w-0 rounded-sm border border-input bg-background px-2.5 font-sans text-sm text-foreground hover:border-foreground'

/** Second line of a row: what kind of entry it is. Worked-with plants show only their family. */
function meta(r: Entry): string {
  if (r.type === 'event') return EVENT_KIND_LABELS[r.event_kind]
  if (r.type === 'day') return `${TYPE_LABELS.day} · ${CAPACITY_LABELS[r.capacity]}`
  if (r.type === 'studied') return `${TYPE_LABELS.studied} · ${r.family}`
  return r.how_studied ? `${r.family} · also studied` : r.family
}

interface RowProps {
  r: Entry
  /** A plant shown beneath its work day: the date is left out, since the day row carries it. */
  nested?: boolean
}

function Row({ r, nested = false }: RowProps) {
  const first = r.images[0]
  // A work day or event with no photo gives its thumbnail column to the title, so the title does not wrap early.
  const wide = !first?.thumb && (r.type === 'day' || r.type === 'event')
  return (
    <Link
      href={`/records/${r.record_no}/`}
      className={cn(
        'group grid grid-cols-[2.75rem_2.5rem_1fr] gap-x-3 px-2 hover:bg-secondary active:bg-muted sm:grid-cols-[3rem_2.5rem_1fr_10rem_7rem] sm:items-center',
        nested ? 'py-2' : 'py-3',
      )}
    >
      <span className="font-sans text-sm leading-7 tabular-nums text-muted-foreground">{r.record_no}</span>
      {/* Thumbnail of the record's photo; the cell stays empty when a record has none. */}
      {!wide && (
        <span className="row-span-2 size-10 sm:row-span-1" aria-hidden="true">
          {first?.thumb && (
            <Image
              src={`${BASE_PATH}${first.thumb}`}
              alt=""
              width={40}
              height={40}
              className={cn(
                'size-10 border object-cover',
                // A coloured border marks a reference photo, i.e. not Danny's own.
                first.kind === 'reference' ? 'border-stamp' : 'border-border',
              )}
            />
          )}
        </span>
      )}
      <span
        className={cn(
          'min-w-0 leading-snug group-hover:text-stamp',
          nested ? 'text-base' : 'text-lg',
          wide && 'col-span-2',
        )}
      >
        <TaxonName html={r.type === 'day' ? r.site.split(',')[0] : entryTitleHtml(r)} />
      </span>
      <span
        className={cn(
          'font-sans text-sm text-muted-foreground sm:col-span-1 sm:col-start-auto',
          wide ? 'col-span-2 col-start-2' : 'col-start-3',
        )}
      >
        {meta(r)}
        {!nested && <span className="sm:hidden"> · {formatDate(r.date, 'short')}</span>}
      </span>
      {!nested && (
        <time dateTime={r.date} className="hidden text-right font-sans text-sm tabular-nums text-muted-foreground sm:block">
          {formatDate(r.date, 'short')}
        </time>
      )}
    </Link>
  )
}

/** The index: an accordion holding search, filters and summaries, then the list. Newest work day first. */
export function RecordIndex({ records }: RecordIndexProps) {
  const [filters, setFilters] = useHashFilters()
  // Work days the reader has folded shut. All start open.
  const [closed, setClosed] = useState<string[]>([])
  const toggle = (no: string) =>
    setClosed((c) => (c.includes(no) ? c.filter((n) => n !== no) : [...c, no]))
  const set = (patch: Partial<RecordFilters>) => setFilters({ ...filters, ...patch })

  const sites = uniqueSorted(records.map((r) => r.site))
  const projects = uniqueSorted(records.flatMap((r) => r.projects))
  const families = uniqueSorted(records.map((r) => (isPlant(r) ? r.family : null)))

  const shown = filterRecords(records, filters).reverse()
  // With no type chosen, a work day and its plants are one block. Filtered to one type, the list is flat.
  const grouped = filters.type === ''
  const blocks: Block[] = grouped ? buildBlocks(shown, records) : shown.map((entry) => ({ entry, plants: [] }))
  const filtered = filtersToHash(filters) !== ''
  // The work days in view that have something beneath them to fold away.
  const foldable = grouped
    ? blocks.filter((b) => b.entry.type === 'day' && (b.entry.tasks.length > 0 || b.plants.length > 0)).map((b) => b.entry.record_no)
    : []
  const allClosed = foldable.length > 0 && foldable.every((no) => closed.includes(no))

  const active = Object.values(filters).filter(Boolean).length

  const form = (
    <form
      role="search"
      aria-label="Search and filter records"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-x-3 gap-y-3 md:grid-cols-12"
    >
      <label className="col-span-2 grid gap-1 md:col-span-4">
        <span className="label">Search</span>
        <input
          id="filter-q"
          type="search"
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Name, family, site or record number"
          className={control}
        />
      </label>

      <label className="col-span-2 grid gap-1 md:col-span-2">
        <span className="label">Type</span>
        <select id="filter-type" value={filters.type} onChange={(e) => set({ type: e.target.value })} className={control}>
          <option value="">All types</option>
          <option value="worked">Worked with</option>
          <option value="studied">Studied</option>
          <option value="event">Events</option>
          <option value="day">Work days</option>
        </select>
      </label>

      <label className="grid gap-1 md:col-span-3">
        <span className="label">Family</span>
        <select id="filter-family" value={filters.family} onChange={(e) => set({ family: e.target.value })} className={control}>
          <option value="">All families</option>
          {families.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 md:col-span-3">
        <span className="label">Site</span>
        <select id="filter-site" value={filters.site} onChange={(e) => set({ site: e.target.value })} className={control}>
          <option value="">All sites</option>
          {sites.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>

      {projects.length > 0 && (
        <label className="col-span-2 grid gap-1 md:col-span-6">
          <span className="label">Project</span>
          <select id="filter-project" value={filters.project} onChange={(e) => set({ project: e.target.value })} className={control}>
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      )}

      <label className="grid gap-1 md:col-span-3">
        <span className="label">From</span>
        <input id="filter-from" type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={control} />
      </label>

      <label className="grid gap-1 md:col-span-3">
        <span className="label">To</span>
        <input id="filter-to" type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={control} />
      </label>
    </form>
  )

  return (
    <div className="grid gap-4">
      <Summary
        records={records}
        filters={form}
        filtersNote={active > 0 ? `${active} set` : undefined}
      />

      <div className="flex min-h-9 items-center justify-between gap-3 border-b border-border pb-1">
        <p className="label" role="status" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'record' : 'records'}
          {filtered && ` of ${records.length}`}
        </p>
        <div className="flex items-center gap-4">
        {foldable.length > 0 && (
          <button
            type="button"
            aria-pressed={allClosed}
            onClick={() => setClosed(allClosed ? [] : foldable)}
            className="label cursor-pointer underline underline-offset-2 hover:text-stamp active:text-foreground"
          >
            {allClosed ? 'Expand all' : 'Collapse all'}
          </button>
        )}
        {filtered && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="label cursor-pointer underline underline-offset-2 hover:text-stamp active:text-foreground"
          >
            Clear filters
          </button>
        )}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="py-6 text-muted-foreground">No records match. Clear the filters to see all {records.length}.</p>
      ) : (
        <ol className="-mt-4">
          {blocks.map(({ entry, plants }) => {
            const hasChildren = entry.type === 'day' && grouped && (entry.tasks.length > 0 || plants.length > 0)
            const open = hasChildren && !closed.includes(entry.record_no)
            const panelId = `day-${entry.record_no}`
            return (
            <li key={entry.record_no} className="border-b border-border">
              {grouped ? (
                <div className="flex items-stretch">
                  <div className="min-w-0 flex-1">
                    <Row r={entry} />
                  </div>
                  {hasChildren ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      aria-label={`${open ? 'Hide' : 'Show'} the work for ${entry.record_no}`}
                      onClick={() => toggle(entry.record_no)}
                      className="flex w-10 shrink-0 cursor-pointer items-center justify-center text-muted-foreground hover:bg-secondary hover:text-stamp active:bg-muted"
                    >
                      {open ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                    </button>
                  ) : (
                    <span className="w-10 shrink-0" aria-hidden="true" />
                  )}
                </div>
              ) : (
                <Row r={entry} />
              )}
              {/* The rule sits under the middle of the day number (8px padding + half of a four-character number). */}
              {entry.type === 'day' && open && (
                <div id={panelId} className="mb-3 ml-[25px] border-l border-stamp pl-3">
                  {entry.tasks.length > 0 && (
                    <ul aria-label="Work done" className="px-2 py-1">
                      {entry.tasks.map((task) => (
                        <li key={task} className="py-1 leading-snug">
                          <TaxonName html={task} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {plants.length > 0 && (
                    <ol aria-label="Plants worked with">
                      {plants.map((p) => (
                        <li key={p.record_no}>
                          <Row r={p} nested />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
