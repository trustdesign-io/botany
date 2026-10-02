import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PrintButton } from '@/components/records/print-button'
import { RecordSheet } from '@/components/records/record-sheet'
import { TaxonName } from '@/components/records/taxon-name'
import { getFile, getNeighbours, getRecord, getRecords } from '@/lib/records'

interface PageProps {
  params: Promise<{ no: string }>
}

export const dynamicParams = false

export function generateStaticParams(): { no: string }[] {
  return getRecords().map((r) => ({ no: r.record_no }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const record = getRecord((await params).no)
  if (!record) return {}
  return {
    title: `${record.record_no} ${record.name}`,
    description: `Record ${record.record_no}: ${record.name}, ${record.family}. ${record.site}.`,
  }
}

export default async function RecordPage({ params }: PageProps) {
  const { no } = await params
  const record = getRecord(no)
  if (!record) notFound()

  const { previous, next } = getNeighbours(no)
  const shortName = (html: string) => html.replace(/<\/i>.*$/, '</i>')

  return (
    <div className="grid gap-6">
      <div className="no-print flex items-center justify-between gap-3">
        <Link href="/" className="label underline underline-offset-2 hover:text-stamp">
          All records
        </Link>
        <PrintButton label="Print record" />
      </div>

      <RecordSheet record={record} keptBy={getFile().kept_by} />

      <nav aria-label="Adjacent records" className="no-print grid grid-cols-2 gap-4 border-t-2 border-rule pt-4">
        <div>
          {previous && (
            <Link href={`/records/${previous.record_no}/`} className="group grid gap-0.5">
              <span className="label">Previous · {previous.record_no}</span>
              <span className="group-hover:text-stamp">
                <TaxonName html={shortName(previous.name_html)} />
              </span>
            </Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link href={`/records/${next.record_no}/`} className="group grid gap-0.5">
              <span className="label">Next · {next.record_no}</span>
              <span className="group-hover:text-stamp">
                <TaxonName html={shortName(next.name_html)} />
              </span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
