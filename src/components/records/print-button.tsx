'use client'

import { PrinterIcon } from 'lucide-react'

interface PrintButtonProps {
  label?: string
}

export function PrintButton({ label = 'Print' }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="label flex h-9 cursor-pointer items-center gap-1.5 rounded-sm border border-input px-3 transition-colors hover:border-stamp hover:text-stamp active:bg-secondary"
    >
      <PrinterIcon size={14} aria-hidden="true" />
      {label}
    </button>
  )
}
