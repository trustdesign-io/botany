# botany

## Project Overview
Public dashboard of D.C. Chambers' plant records, served at dannychambers.co.uk/botany. The records live in `public/plant-records.json` (the single source of truth, also read directly by Claude); the site renders them. For Danny and anyone interested in the plants he has worked with.

## Read first
`PRD.md` and `PLAN.md` are the source of truth for scope, pages and brand.

## Adding or changing a record (runbook)
The records live in `public/plant-records.json`. The site is built from that file; there is no admin screen.

Every entry has a `type`, and each type has its own number sequence:

| `type` | What it is | `record_no` | Extra fields |
|---|---|---|---|
| `worked` | A plant Danny worked with | `001`, `002`… | location, vice_county, grid_ref, det, label_read, provenance, work_done, how_studied, log |
| `studied` | A species investigated but not worked with | `S001`, `S002`… | how_studied; `site` may be `null` |
| `event` | A lecture, visit, course or other attendance | `E001`, `E002`… | title, event_kind (`lecture`, `visit`, `course`, `other`), organiser, notes, species (list), url; no plant fields |
| `day` | A day worked at a site | `D001`, `D002`… | organisation, capacity (`volunteer`, `contract`, `own`), hours, with_whom, tasks (list); no plant fields |

- If Danny does not say which type, ask. "Worked with" means hands on the plant.
- A plant both worked with and studied stays one `worked` record: set its `how_studied` (how, in Danny's words). It then also shows under the Studied filter. `how_studied` is `null` on a worked plant he did not study; never set it on your own initiative.
- An event is one entry. Species seen go in its `species` list (names in `<i>…</i>`); do not create a record per species unless Danny asks for one.
- Never add an event or studied species on your own initiative, and never guess a date: Danny gives each one with its date.
- A work day is linked to the plants worked with by date and site, not stored: the `worked` entries with the same `date` and the same `site` string appear on the day's page, and each links back. So when adding a `worked` record, make sure a `day` exists for that date and site (add one if not), and copy the `site` string exactly. One work day per date and site.
- Work that did not involve a specific plant (watering a tunnel, building a bridge, clearing a site) goes in the day's `tasks` list, one short item each. Do not make a record for it.
- In the full list a work day is one block: its tasks and its plants sit beneath it. Filtered to one type, the list is flat.
- Hours are not recorded or shown: leave a day's `hours` as `null`. Danny dropped them (Oct 2026); days worked are what count.
- Regular days: Lullingstone on Fridays with T. Hart Dyke (volunteer); Shorne Woods Country Park on Tuesdays for Kent County Council (volunteer). Do not add a day Danny has not confirmed he attended.
- The schema in `src/lib/records.ts` and the types in `src/types/record.ts` list every field per type.

1. Branch: `feature/records-NNN` (or `fix/record-NNN`).
2. Edit `public/plant-records.json`:
   - New entries take the next `record_no` in their own type's sequence (`023`, `S001`, `E001`). Each sequence runs across all sites, in the order of the work; never renumber existing records without Danny asking.
   - `date` is ISO (`2026-10-02`). Set `site`. `projects` is a list: `[]` for none, or one or more project names. A record with several projects still appears once; never duplicate a record.
   - A field that is not known is `null`. Never fill a field with a guess: it comes from Danny, the plant's label, or a citable authority.
   - The only markup is `<i>…</i>` around botanical names. No HTML entities; write `&` not `&amp;`.
   - `name` must equal `name_html` with the tags removed.
   - `label_read` is the label word for word, errors included.
   - Lullingstone determinations default to `T. Hart Dyke (verbal), relayed to D.C. Chambers, {date} — not keyed`.
   - Set `powo_url` to the accepted taxon's POWO page, or `null`.
   - `images` is a list of photos, `[]` for none, in the order Danny gives them. The first is the one shown in the index. Save them as `public/images/NNN.jpg`, `NNN-2.jpg`, `NNN-3.jpg`… (about 1024px on the long side). The first also needs a 96px square crop, `public/images/NNN-thumb.jpg`; `thumb` is `null` on the rest. Own and reference photos are never mixed in one record.
     - `kind: "own"`: a photo Danny took of the plant recorded. Credit `D.C. Chambers`, set `taken` if known, licence and source `null`. **An own photo always replaces a reference one.**
     - `kind: "reference"`: a photo of the species from a public source, never presented as Danny's plant. Use iNaturalist (API `api.inaturalist.org/v1`, filter `photo_license=cc0,cc-by,cc-by-sa`, research grade); Wikimedia Commons rate-limits the build environment. Check the photo against the record's diagnostic before using it, and record `credit`, `licence`, `licence_url`, `source` and `source_url`. No openly licensed photo that matches: leave `images` as `[]`.
   - `log` (worked-with plants only) is a list of dated additions, oldest first, for a plant Danny returns to: `{ date, site, location, text, images }`. Return work on a plant is a log entry, never a second record. `site` is the work day's site string copied exactly when it happened on a work day (the plant then shows on that day's page), otherwise `null`; `location` is where exactly (a polytunnel, his terrarium at home). `text` is Danny's account. Log photos are own photos, saved as `NNN-YYYYMMDD.jpg`, `NNN-YYYYMMDD-2.jpg`…, `thumb` `null`.
   - Bump the top-level `updated` date.
3. Run `npx vitest run --project unit`. It validates the file against the schema in `src/lib/records.ts`; a malformed file fails CI and never deploys.
4. Run `npm run build`, then open a PR. Merging to `main` deploys to dannychambers.co.uk/botany.

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router), static export |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| State (client) | Zustand |
| Testing | Vitest + Playwright + React Testing Library |
| Deployment | Static export (`output: 'export'`, basePath `/botany`) uploaded to cPanel `public_html/botany` by `.github/workflows/deploy.yml` — not Vercel |

> This is a static starter — no database, no auth, no server-side user state.

## Directory Structure
```
src/
├── app/              # Next.js App Router — pages, layouts
│   └── (public)/     # Public pages with Header + Footer layout
├── components/       # Shared reusable components
│   ├── layout/       # Header, Footer, Logo
│   └── ui/           # shadcn/ui base components (do not edit directly)
├── lib/              # Utilities, helpers, config
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores
└── types/            # TypeScript type definitions
```

## Coding Conventions
- **Components:** Functional components with TypeScript. Named exports only (no default exports except for page.tsx files required by Next.js).
- **Server vs Client:** Default to React Server Components. Add `'use client'` only when required (event handlers, browser APIs, hooks).
- **Types:** No `any`. Every function parameter and return value should be typed. Use `interface` for object shapes, `type` for unions/intersections.
- **Imports:** Group in order: external packages → internal paths → types → styles. Use `@/` alias for `src/`.
- **Error handling:** Components use error boundaries. Always show user-friendly messages.
- **Accessibility:** Semantic HTML, keyboard navigation, WCAG AA colour contrast, meaningful alt text on all images.

## Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-profile.tsx` |
| React components | PascalCase | `UserProfile` |
| Hooks | camelCase + "use" prefix | `useScrollPosition` |
| Utilities | camelCase | `formatCurrency` |
| Types / Interfaces | PascalCase | `PageProps`, `ApiResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Zustand stores | camelCase + "Store" | `useThemeStore` |
| API routes | kebab-case | `/api/contact` |

## Git Conventions
- **Branches:** `feature/short-description`, `fix/short-description`, `chore/short-description`
- **Commits:** Conventional commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **PRs:** Always open a PR. Never push directly to `main`. PRs must pass CI.
- **Reviews:** Tag `@claude` in PR comments for AI-assisted review.

## Running the Project
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint check
npm run storybook    # Storybook on localhost:6006
```

## Environment Variables
Copy `.env.example` to `.env.local` and fill in values. Never commit `.env.local`.

## Key Contacts & Links
| Resource | Link |
|----------|------|
| Live site | https://dannychambers.co.uk/botany/ |
| Data file | https://dannychambers.co.uk/botany/plant-records.json |
| Figma designs | [link] |
| GitHub repo | https://github.com/trustdesign-io/botany |
| Linear / project board | [link] |
