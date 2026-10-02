import { renderInline } from '@/lib/inline'

interface TaxonNameProps {
  /** Name with botanical names wrapped in <i>…</i>; authorities and cultivars stay upright. */
  html: string
  className?: string
}

export function TaxonName({ html, className }: TaxonNameProps) {
  return <span className={className}>{renderInline(html)}</span>
}
