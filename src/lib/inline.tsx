import type { ReactNode } from 'react'

/**
 * Renders record text, turning <i>…</i> into italics. Everything else is
 * output as plain text, so the data can never inject markup.
 */
export function renderInline(text: string): ReactNode[] {
  return text.split(/(<i>.*?<\/i>)/g).filter(Boolean).map((part, i) => {
    const m = /^<i>(.*)<\/i>$/.exec(part)
    return m ? <i key={i}>{m[1]}</i> : <span key={i}>{part}</span>
  })
}
