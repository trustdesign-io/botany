import Image from 'next/image'
import type { RecordImage as RecordImageData } from '@/types/record'
import { formatDate } from '@/lib/records'
import { BASE_PATH } from '@/lib/site'

interface RecordImageProps {
  image: RecordImageData
  /** Caption label for an own photo. Events are not plants, so they pass their own. */
  ownLabel?: string
}

const link = 'underline underline-offset-2 hover:text-stamp'

/**
 * The record's photo. An `own` photo is of the plant recorded. A `reference`
 * photo is of the species, from a public source, and is labelled so it is
 * never mistaken for the plant recorded.
 */
export function RecordImage({ image, ownLabel = 'The plant recorded' }: RecordImageProps) {
  return (
    <figure className="no-print grid gap-2">
      <Image
        src={`${BASE_PATH}${image.src}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 640px) 20rem, 100vw"
        className="h-auto w-full border border-border"
      />
      <figcaption className="font-sans text-xs leading-snug text-muted-foreground">
        {image.kind === 'own' ? (
          <>
            <span className="label block">{ownLabel}</span>
            Photo: {image.credit}
            {image.taken && `, ${formatDate(image.taken)}`}.
          </>
        ) : (
          <>
            <span className="label block">Reference image, not this plant</span>
            Photo: {image.credit}
            {image.licence && image.licence_url && (
              <>
                ,{' '}
                <a href={image.licence_url} rel="noopener license" className={link}>
                  {image.licence}
                </a>
              </>
            )}
            {image.source && image.source_url && (
              <>
                , via{' '}
                <a href={image.source_url} rel="noopener" className={link}>
                  {image.source}
                </a>
              </>
            )}
            .
          </>
        )}
      </figcaption>
    </figure>
  )
}
