/** Must match `basePath` in next.config.ts. Needed for plain URLs that next/link does not rewrite. */
export const BASE_PATH = '/botany'

/** The address of a photo under /public, with the build stamp so browsers refetch it after each deploy. */
export function imageUrl(path: string): string {
  const build = process.env.NEXT_PUBLIC_BUILD
  return `${BASE_PATH}${path}${build ? `?v=${build}` : ''}`
}
