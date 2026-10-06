/** Must match `basePath` in next.config.ts. Needed for plain URLs that next/link does not rewrite. */
export const BASE_PATH = '/botany'

/** The address of a photo under /public, with the build stamp so browsers refetch it after each deploy. */
export function imageUrl(path: string): string {
  const build = process.env.NEXT_PUBLIC_BUILD
  return `${BASE_PATH}${path}${build ? `?v=${build}` : ''}`
}

/** A venue's logo, keyed by the first part of its `site` string. One file per venue under /public/images/sites. */
const SITE_LOGOS: Record<string, string> = {
  'Lullingstone Castle': '/images/sites/lullingstone-castle.png',
  'Shorne Woods Country Park': '/images/sites/shorne-woods-country-park.png',
  'Riverview Academy': '/images/sites/riverview-academy.png',
}

/** The logo for a site, or undefined when the venue has none (e.g. the Home collection). */
export function siteLogo(site: string | null): string | undefined {
  return site ? SITE_LOGOS[site.split(',')[0]] : undefined
}
