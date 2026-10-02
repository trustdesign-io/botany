'use client'

import Link from 'next/link'
import type { PlantRecord } from '@/types/record'
import { EMPTY_FILTERS, type RecordFilters, filterRecords, filtersToHash, uniqueSorted } from '@/lib/filter'
import { formatDate } from '@/lib/records'
import { useHashFilters } from '@/hooks/use-hash-filters'
import { TaxonName } from './taxon-name'

interface RecordIndexProps {
  /** All records, oldest first. */
  records: PlantRecord[]
}

const control =
  'h-10 w-full min-w-0 rounded-sm border border-input bg-background px-2.5 font-sans text-sm text-foreground hover:border-foreground'

/** The list of records with search and filters. Newest work day first. */
export function RecordIndex({ records }: RecordIndexProps) {
  const [filters, setFilters] = useHashFilters()
  const set = (patch: Partial<RecordFilters>) => setFilters({ ...filters, ...patch })

  const sites = uniqueSorted(records.map((r) => r.site))
<<<<<<< HEAD
  const projects = uniqueSorted(records.flatMap((r) => r.projects))
=======
  const projects = uniqueSorted(records.map((r) => r.project))
>>>>>>> 3c80d5b0afd58b65e0f08ef397adf154aa82c565
  const families = uniqueSorted(records.map((r) => r.family))

  const shown = filterRecords(records, filters).reverse()
  const filtered = filtersToHash(filters) !== ''

  return (
    <div className="grid gap-4">
      <form
        role="search"
        aria-label="Search and filter records"
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4"
      >
        <label className="col-span-2 grid gap-1 sm:col-span-4">
          <span className="label">Search</span>
          <input
            id="filter-q"
            type="search"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Name, family or record number"
            className={control}
          />
        </label>

        <label className="grid gap-1">
          <span className="label">Family</span>
          <select id="filter-family" value={filters.family} onChange={(e) => set({ family: e.target.value })} className={control}>
            <option value="">All families</option>
            {families.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="label">Site</span>
          <select id="filter-site" value={filters.site} onChange={(e) => set({ site: e.target.value })} className={control}>
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        {projects.length > 0 && (
          <label className="col-span-2 grid gap-1 sm:col-span-4">
            <span className="label">Project</span>
            <select id="filter-project" value={filters.project} onChange={(e) => set({ project: e.target.value })} className={control}>
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        )}

        <label className="grid gap-1">
          <span className="label">From</span>
          <input id="filter-from" type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} className={control} />
        </label>

        <label className="grid gap-1">
          <span className="label">To</span>
          <input id="filter-to" type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} className={control} />
        </label>
      </form>

      <div className="flex min-h-9 items-center justify-between gap-3 border-b-2 border-rule pb-1">
        <p className="label" role="status" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'record' : 'records'}
          {filtered && ` of ${records.length}`}
        </p>
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

      {shown.length === 0 ? (
        <p className="py-6 text-muted-foreground">No records match. Clear the filters to see all {records.length}.</p>
      ) : (
        <ol className="-mt-4">
          {shown.map((r) => (
            <li key={r.record_no} className="border-b border-border">
              <Link
                href={`/records/${r.record_no}/`}
                className="group grid grid-cols-[2.75rem_1fr] gap-x-3 py-3 hover:bg-secondary active:bg-muted sm:grid-cols-[3rem_1fr_9rem_7rem] sm:items-baseline"
              >
                <span className="font-sans text-sm leading-7 tabular-nums text-muted-foreground">{r.record_no}</span>
                <span className="min-w-0 text-lg leading-snug group-hover:text-stamp">
                  <TaxonName html={r.name_html} />
                </span>
                <span className="col-start-2 font-sans text-sm text-muted-foreground sm:col-start-auto">
                  {r.family}
                  <span className="sm:hidden"> · {formatDate(r.date, 'short')}</span>
                </span>
                <time dateTime={r.date} className="hidden text-right font-sans text-sm tabular-nums text-muted-foreground sm:block">
                  {formatDate(r.date, 'short')}
                </time>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
