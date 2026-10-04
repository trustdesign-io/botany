import type { Metadata } from 'next'
import Link from 'next/link'
import { Summary } from '@/components/records/summary'
import { TYPE_LABELS, getRecords } from '@/lib/records'
import type { EntryType } from '@/types/record'

export const metadata: Metadata = {
  title: 'Analysis',
  description: 'The records in summary: work days by month and site, plant families, native ranges and a timeline.',
}

const TYPES: EntryType[] = ['worked', 'studied', 'event', 'day']

export default function AnalysisPage() {
  const records = getRecords()

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <h1 className="text-3xl leading-tight text-balance sm:text-4xl">Analysis</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          The records in summary. To search or filter them, use{' '}
          <Link href="/" className="underline underline-offset-2 hover:text-stamp">
            the list
          </Link>
          .
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {TYPES.map((type) => (
          <div key={type}>
            <dt className="label">{TYPE_LABELS[type]}</dt>
            <dd className="font-sans text-3xl font-light tabular-nums">
              {records.filter((r) => r.type === type).length}
            </dd>
          </div>
        ))}
      </dl>

      <Summary records={records} analysis />
    </div>
  )
}
