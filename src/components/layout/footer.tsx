import { formatDate, getFile, getRecords } from '@/lib/records'

/** Path to the published data file. A plain <a>, so the base path is written out. */
export const DATA_URL = '/botany/plant-records.json'

export function Footer() {
  const file = getFile()
  const count = getRecords().length

  return (
    <footer className="no-print mt-12 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 font-sans text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>
          Kept by {file.kept_by}. {count} records, updated {formatDate(file.updated)}.
        </p>
        <p>
          <a href={DATA_URL} className="underline underline-offset-2 hover:text-stamp">
            Data file (JSON)
          </a>
        </p>
      </div>
    </footer>
  )
}
