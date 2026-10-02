import Image from 'next/image'
import type { ReferenceImage as ReferenceImageData } from '@/types/record'
import { BASE_PATH } from '@/lib/site'

interface ReferenceImageProps {
  image: ReferenceImageData
}

/**
 * A photo of the species from a public source, with its credit and licence.
 * Labelled so it is never mistaken for a photo of the plant recorded.
 */
export function ReferenceImage({ image }: ReferenceImageProps) {
  return (
    <figure className="no-print grid gap-2 sm:max-w-xs">
      <Image
        src={`${BASE_PATH}${image.src}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 640px) 20rem, 100vw"
        className="h-auto w-full border border-border"
      />
      <figcaption className="font-sans text-xs leading-snug text-muted-foreground">
        <span className="label block">Reference image, not this plant</span>
        Photo: {image.credit},{' '}
        <a href={image.licence_url} rel="noopener license" className="underline underline-offset-2 hover:text-stamp">
          {image.licence}
        </a>
        , via{' '}
        <a href={image.source_url} rel="noopener" className="underline underline-offset-2 hover:text-stamp">
          {image.source}
        </a>
        .
      </figcaption>
    </figure>
  )
}
