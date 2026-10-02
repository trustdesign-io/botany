# starter-static

Next.js 15 starter template for static/marketing trustdesign projects. Same foundation as `starter-web` but without Supabase, Prisma, or authenticated flows.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui, Vitest, Playwright, Storybook

## Quick start

```bash
npm install
npm run dev          # localhost:3000
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run storybook    # Storybook on localhost:6006
npm run build-storybook  # Build static Storybook
```

## When to use this vs starter-web

Use **starter-static** for sites that don't need a database, authentication, or server-side user state — marketing sites, landing pages, portfolios, documentation sites, etc.

Use **starter-web** when you need Supabase auth, Prisma ORM, and protected routes.
