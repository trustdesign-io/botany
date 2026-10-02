import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { renderInline } from '@/lib/inline'

interface BlankProps {
  /** Ruled lines to leave when printed. */
  lines?: number
}

/** A field with nothing recorded. Shown as a rule so the gap stays visible. */
export function Blank({ lines = 1 }: BlankProps) {
  return (
    <span className="blank">
      <span className="sr-only">Not recorded</span>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} aria-hidden="true" />
      ))}
    </span>
  )
}

interface RecordFieldProps {
  label: string
  /** Record text, or null when not yet recorded. */
  value: string | null
  /** Ruled lines to leave on the printed sheet when blank. */
  lines?: number
  /** Smaller text, for notes, sources and open questions. */
  small?: boolean
  children?: ReactNode
}

/** One labelled field of a record. Label above on a phone, beside from 640px and in print. */
export function RecordField({ label, value, lines = 1, small = false, children }: RecordFieldProps) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[7.5rem_1fr] print:grid-cols-[7.5rem_1fr]">
      <dt className="label pt-1">{label}</dt>
      <dd className={cn('min-w-0 break-words', small && 'text-[0.92em] text-muted-foreground')}>
        {value === null ? <Blank lines={lines} /> : renderInline(value)}
        {children}
      </dd>
    </div>
  )
}
