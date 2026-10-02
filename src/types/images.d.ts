// Static image imports. next-env.d.ts also declares these, but it is generated
// by the build and not committed, and CI type-checks before it builds.
declare module '*.jpg' {
  const content: import('next/image').StaticImageData
  export default content
}
