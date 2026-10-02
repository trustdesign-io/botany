import type { Metadata } from 'next'
import Link from 'next/link'
import { PrintButton } from '@/components/records/print-button'
import { RecordSheet } from '@/components/records/record-sheet'
import { getFile, getRecords } from '@/lib/records'

export const metadata: Metadata = {
  title: 'Print all records',
  robots: { index: false },
}

export default function PrintAllPage() {
  const records = getRecords()
  const keptBy = getFile().kept_by

  return (
    <div className="grid gap-10 print:block">
      <div className="no-print flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl leading-tight">Print all records</h1>
          <p className="mt-1 text-muted-foreground">
            {records.length} records, one A4 sheet each.{' '}
            <Link href="/" className="underline underline-offset-2 hover:text-stamp">
              Back to the records
            </Link>
          </p>
        </div>
        <PrintButton label="Print all" />
      </div>

      {records.map((r) => (
        <RecordSheet key={r.record_no} record={r} headingLevel="h2" keptBy={keptBy} />
      ))}
    </div>
  )
}
