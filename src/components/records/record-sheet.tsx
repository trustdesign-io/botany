import type { PlantRecord } from '@/types/record'
import { formatDate } from '@/lib/records'
import { Blank, RecordField } from './record-field'
import { TaxonName } from './taxon-name'

interface RecordSheetProps {
  record: PlantRecord
  /** h1 on a record's own page; h2 when several sheets share a page. */
  headingLevel?: 'h1' | 'h2'
  keptBy: string
}

/**
 * A whole record, in the record book's fixed field order. The same component
 * is the web page and the printed A4 sheet.
 */
export function RecordSheet({ record: r, headingLevel: Heading = 'h1', keptBy }: RecordSheetProps) {
  return (
    <article className="sheet">
      <header className="flex items-end justify-between gap-4 border-b-2 border-rule pb-3">
        <div className="min-w-0">
          <p className="label">Plant record</p>
          <Heading className="mt-1 text-2xl leading-tight text-balance sm:text-3xl print:text-[19pt]">
            <TaxonName html={r.name_html} />
          </Heading>
        </div>
        <p className="font-sans text-4xl leading-none font-light tabular-nums sm:text-5xl print:text-[30pt]">
          <span className="sr-only">Record number </span>
          {r.record_no}
        </p>
      </header>

      <dl>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-border py-4 print:py-2.5 sm:grid-cols-[1fr_2fr] print:grid-cols-[1fr_2fr]">
          <div>
            <dt className="label">Date</dt>
            <dd>
              <time dateTime={r.date}>{formatDate(r.date)}</time>
            </dd>
          </div>
          <div>
            <dt className="label">Site</dt>
            <dd>{r.site}</dd>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-[2fr_1fr_1fr] print:grid-cols-[2fr_1fr_1fr]">
            <div className="col-span-2 sm:col-span-1 print:col-span-1">
              <dt className="label">Location</dt>
              <dd>{r.location ?? <Blank />}</dd>
            </div>
            <div>
              <dt className="label">VC</dt>
              <dd>{r.vice_county ?? <Blank />}</dd>
            </div>
            <div>
              <dt className="label">Grid</dt>
              <dd>{r.grid_ref ?? <Blank />}</dd>
            </div>
          </div>
<<<<<<< HEAD
          {r.projects.length > 0 && (
            <div className="col-span-2">
              <dt className="label">{r.projects.length === 1 ? 'Project' : 'Projects'}</dt>
              <dd>{r.projects.join('; ')}</dd>
=======
          {r.project && (
            <div className="col-span-2">
              <dt className="label">Project</dt>
              <dd>{r.project}</dd>
>>>>>>> 3c80d5b0afd58b65e0f08ef397adf154aa82c565
            </div>
          )}
        </div>

        <div className="grid gap-3 print:gap-2 border-b border-border py-4 print:py-2.5">
          <RecordField label="Family" value={r.family} />
          <RecordField label="Det." value={r.det} />
          <RecordField label="Label read" value={r.label_read} />
          {r.note && <RecordField label="Note" value={r.note} small />}
        </div>

        <div className="grid gap-3 print:gap-2 border-b border-border py-4 print:py-2.5">
          <RecordField label="Common names" value={r.common_names} />
          <RecordField label="Native range" value={r.native_range} />
          <RecordField label="Habit" value={r.habit} />
          <RecordField label="Provenance" value={r.provenance} />
        </div>

        <div className="grid gap-3 print:gap-2 border-b border-border py-4 print:py-2.5">
          <RecordField label="Diagnostic" value={r.diagnostic} lines={3} />
          <RecordField label="Near misses" value={r.near_misses} lines={2} />
        </div>

        <div className="grid gap-3 print:gap-2 border-b border-border py-4 print:py-2.5">
          <RecordField label="Work done" value={r.work_done} lines={4} />
          <RecordField label="Observed" value={r.observed} lines={4} />
        </div>

        <div className="grid gap-3 print:gap-2 py-4 print:py-2.5">
          <RecordField label="Sources" value={r.sources} small>
            {r.powo_url && (
              <span className="no-print">
                {' '}
                <a
                  href={r.powo_url}
                  rel="noopener"
                  className="whitespace-nowrap text-stamp underline underline-offset-2 hover:text-foreground"
                >
                  View on POWO
                </a>
              </span>
            )}
          </RecordField>
          <RecordField label="Open questions" value={r.open_questions} small />
        </div>
      </dl>

      <p className="label hidden justify-between pt-2 font-medium print:flex">
        <span>Plant records · {keptBy}</span>
        <span>Record {r.record_no}</span>
      </p>
    </article>
  )
}
