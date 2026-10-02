import Link from 'next/link'
import { RecordIndex } from '@/components/records/record-index'
import { Summary } from '@/components/records/summary'
import { getRecords } from '@/lib/records'

export default function IndexPage() {
  const records = getRecords()

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl leading-tight text-balance sm:text-4xl">Records</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Every plant I have worked with, one record each, numbered in the order of the work.{' '}
          <Link href="/about/" className="underline underline-offset-2 hover:text-stamp">
            How the records are kept
          </Link>
          .
        </p>
      </div>

      <Summary records={records} />
      <RecordIndex records={records} />

      <p className="no-print">
        <Link href="/print/" className="label underline underline-offset-2 hover:text-stamp">
          Print all records
        </Link>
      </p>
    </div>
  )
}
