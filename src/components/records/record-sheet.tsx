import type { ReactNode } from 'react'
import Link from 'next/link'
import type { DayRecord, Entry, EventRecord, StudiedRecord, WorkedRecord } from '@/types/record'
import {
  CAPACITY_LABELS,
  EVENT_KIND_LABELS,
  entryTitleHtml,
  findPlantByName,
  formatDate,
  getDayFor,
  getPlantsForDay,
  weekday,
} from '@/lib/records'
import { Blank, RecordField } from './record-field'
import { RecordImage } from './record-image'
import { TaxonName } from './taxon-name'

interface RecordSheetProps {
  record: Entry
  /** h1 on a record's own page; h2 when several sheets share a page. */
  headingLevel?: 'h1' | 'h2'
  keptBy: string
}

const OWN_PHOTO_LABELS: Record<Entry['type'], string> = {
  worked: 'The plant recorded',
  studied: 'The plant studied',
  event: 'At the event',
  day: 'On the day',
}

const group = 'grid gap-3 print:gap-2 border-b border-border py-4 print:py-2.5'
const lastGroup = 'grid gap-3 print:gap-2 py-4 print:py-2.5'
const topGrid =
  'grid grid-cols-2 gap-x-6 gap-y-3 border-b border-border py-4 print:py-2.5 sm:grid-cols-[1fr_2fr] print:grid-cols-[1fr_2fr]'

/** The line above the title, saying what kind of entry this is. */
function kicker(r: Entry): string {
  if (r.type === 'worked') return 'Plant record'
  if (r.type === 'studied') return 'Species studied'
  if (r.type === 'day') return `Work day · ${CAPACITY_LABELS[r.capacity]}`
  return `Event · ${EVENT_KIND_LABELS[r.event_kind]}`
}

function TopCell({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : undefined}>
      <dt className="label">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function Projects({ projects }: { projects: string[] }) {
  if (projects.length === 0) return null
  return (
    <TopCell label={projects.length === 1 ? 'Project' : 'Projects'} wide>
      {projects.join('; ')}
    </TopCell>
  )
}

function Sources({ r }: { r: Entry }) {
  const powo = 'powo_url' in r ? r.powo_url : null
  return (
    <div className={lastGroup}>
      <RecordField label="Sources" value={r.sources} small>
        {powo && (
          <span className="no-print">
            {' '}
            <a
              href={powo}
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
  )
}

const quietLink = 'underline decoration-border underline-offset-2 hover:text-stamp hover:decoration-stamp'

/** A plant worked with: the record book's fixed field order. */
function WorkedBody({ r }: { r: WorkedRecord }) {
  const day = getDayFor(r)
  return (
    <dl>
      <div className={topGrid}>
        <TopCell label="Date">
          <time dateTime={r.date}>{formatDate(r.date)}</time>
        </TopCell>
        <TopCell label="Site">{r.site}</TopCell>
        <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-[2fr_1fr_1fr] print:grid-cols-[2fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-1 print:col-span-1">
            <dt className="label">Location</dt>
            <dd>{r.location ?? <Blank />}</dd>
          </div>
          <TopCell label="VC">{r.vice_county ?? <Blank />}</TopCell>
          <TopCell label="Grid">{r.grid_ref ?? <Blank />}</TopCell>
        </div>
        {day && (
          <div className="no-print col-span-2">
            <dt className="label">Work day</dt>
            <dd>
              <Link href={`/records/${day.record_no}/`} className={quietLink}>
                {day.record_no}
              </Link>
              <span className="text-muted-foreground">
                {' '}
                · {CAPACITY_LABELS[day.capacity]}
                {day.organisation && `, ${day.organisation}`}
              </span>
            </dd>
          </div>
        )}
        <Projects projects={r.projects} />
      </div>

      <div className={group}>
        <RecordField label="Family" value={r.family} />
        <RecordField label="Det." value={r.det} />
        <RecordField label="Label read" value={r.label_read} />
        {r.note && <RecordField label="Note" value={r.note} small />}
      </div>

      <div className={group}>
        <RecordField label="Common names" value={r.common_names} />
        <RecordField label="Native range" value={r.native_range} />
        <RecordField label="Habit" value={r.habit} />
        <RecordField label="Provenance" value={r.provenance} />
      </div>

      <div className={group}>
        <RecordField label="Diagnostic" value={r.diagnostic} lines={3} />
        <RecordField label="Near misses" value={r.near_misses} lines={2} />
      </div>

      <div className={group}>
        <RecordField label="Work done" value={r.work_done} lines={4} />
        <RecordField label="Observed" value={r.observed} lines={4} />
      </div>

      <Sources r={r} />
    </dl>
  )
}

/** A species studied but not worked with: the plant fields, without the hands-on ones. */
function StudiedBody({ r }: { r: StudiedRecord }) {
  return (
    <dl>
      <div className={topGrid}>
        <TopCell label="Date">
          <time dateTime={r.date}>{formatDate(r.date)}</time>
        </TopCell>
        <TopCell label="Where">{r.site ?? <Blank />}</TopCell>
        <Projects projects={r.projects} />
      </div>

      <div className={group}>
        <RecordField label="Family" value={r.family} />
        <RecordField label="How studied" value={r.how_studied} lines={2} />
        {r.note && <RecordField label="Note" value={r.note} small />}
      </div>

      <div className={group}>
        <RecordField label="Common names" value={r.common_names} />
        <RecordField label="Native range" value={r.native_range} />
        <RecordField label="Habit" value={r.habit} />
      </div>

      <div className={group}>
        <RecordField label="Diagnostic" value={r.diagnostic} lines={3} />
        <RecordField label="Near misses" value={r.near_misses} lines={2} />
      </div>

      <div className={group}>
        <RecordField label="Observed" value={r.observed} lines={4} />
      </div>

      <Sources r={r} />
    </dl>
  )
}

/** A lecture, visit or course. The species seen are listed here, not given records of their own. */
function EventBody({ r }: { r: EventRecord }) {
  return (
    <dl>
      <div className={topGrid}>
        <TopCell label="Date">
          <time dateTime={r.date}>{formatDate(r.date)}</time>
        </TopCell>
        <TopCell label="Place">{r.site}</TopCell>
        <Projects projects={r.projects} />
      </div>

      <div className={group}>
        <RecordField label="Organiser or speaker" value={r.organiser} />
        {r.url && (
          <div className="no-print grid gap-x-4 gap-y-0.5 sm:grid-cols-[7.5rem_1fr]">
            <dt className="label pt-1">Link</dt>
            <dd className="min-w-0 break-words">
              <a href={r.url} rel="noopener" className="text-stamp underline underline-offset-2 hover:text-foreground">
                {r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </dd>
          </div>
        )}
        {r.note && <RecordField label="Note" value={r.note} small />}
      </div>

      <div className={group}>
        <RecordField label="Notes" value={r.notes} lines={6} />
      </div>

      <div className={group}>
        <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[7.5rem_1fr] print:grid-cols-[7.5rem_1fr]">
          <dt className="label pt-1">Species</dt>
          <dd className="min-w-0">
            {r.species.length === 0 ? (
              <Blank lines={3} />
            ) : (
              <ul className="grid gap-1">
                {r.species.map((name) => {
                  const record = findPlantByName(name)
                  return (
                    <li key={name}>
                      {record ? (
                        <Link
                          href={`/records/${record.record_no}/`}
                          className={quietLink}
                        >
                          <TaxonName html={name} />
                          <span className="font-sans text-sm text-muted-foreground"> · {record.record_no}</span>
                        </Link>
                      ) : (
                        <TaxonName html={name} />
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </dd>
        </div>
      </div>

      <Sources r={r} />
    </dl>
  )
}

/** A day worked at a site, with the plants worked with that day listed from their own records. */
function DayBody({ r }: { r: DayRecord }) {
  const plants = getPlantsForDay(r)
  return (
    <dl>
      <div className={topGrid}>
        <TopCell label="Date">
          <time dateTime={r.date}>
            {weekday(r.date)} {formatDate(r.date)}
          </time>
        </TopCell>
        <TopCell label="Site">{r.site}</TopCell>
        <Projects projects={r.projects} />
      </div>

      <div className={group}>
        <RecordField label="For" value={r.organisation} />
        <RecordField label="Capacity" value={CAPACITY_LABELS[r.capacity]} />
        <RecordField label="Hours" value={r.hours === null ? null : String(r.hours)} />
        <RecordField label="With" value={r.with_whom} />
        {r.note && <RecordField label="Note" value={r.note} small />}
      </div>

      <div className={group}>
        <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[7.5rem_1fr] print:grid-cols-[7.5rem_1fr]">
          <dt className="label pt-1">Work done</dt>
          <dd className="min-w-0">
            {r.tasks.length === 0 ? (
              <Blank lines={4} />
            ) : (
              <ul className="grid gap-1">
                {r.tasks.map((task) => (
                  <li key={task}>
                    <TaxonName html={task} />
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </div>

      <div className={group}>
        <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[7.5rem_1fr] print:grid-cols-[7.5rem_1fr]">
          <dt className="label pt-1">Plants worked with</dt>
          <dd className="min-w-0">
            {plants.length === 0 ? (
              <span className="text-muted-foreground">None recorded for this day.</span>
            ) : (
              <ul className="grid gap-1">
                {plants.map((p) => (
                  <li key={p.record_no}>
                    <Link href={`/records/${p.record_no}/`} className={quietLink}>
                      <span className="font-sans text-sm tabular-nums text-muted-foreground">{p.record_no} </span>
                      <TaxonName html={p.name_html} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
      </div>

      <Sources r={r} />
    </dl>
  )
}

/**
 * A whole entry. The same component is the web page and the printed A4 sheet.
 * Worked-with plants keep the record book's fixed field order.
 */
export function RecordSheet({ record: r, headingLevel: Heading = 'h1', keptBy }: RecordSheetProps) {
  return (
    <article className="sheet">
      <header className="flex items-end justify-between gap-4 border-b-2 border-rule pb-3">
        <div className="min-w-0">
          <p className="label">{kicker(r)}</p>
          <Heading className="mt-1 text-2xl leading-tight text-balance sm:text-3xl print:text-[19pt]">
            <TaxonName html={entryTitleHtml(r)} />
          </Heading>
        </div>
        <p className="font-sans text-4xl leading-none font-light tabular-nums sm:text-5xl print:text-[30pt]">
          <span className="sr-only">Record number </span>
          {r.record_no}
        </p>
      </header>

      {r.image && (
        <div className="border-b border-border py-4">
          <RecordImage
            image={r.image}
            ownLabel={OWN_PHOTO_LABELS[r.type]}
          />
        </div>
      )}

      {r.type === 'worked' && <WorkedBody r={r} />}
      {r.type === 'studied' && <StudiedBody r={r} />}
      {r.type === 'event' && <EventBody r={r} />}
      {r.type === 'day' && <DayBody r={r} />}

      <p className="label hidden justify-between pt-2 font-medium print:flex">
        <span>Records · {keptBy}</span>
        <span>Record {r.record_no}</span>
      </p>
    </article>
  )
}
