# Plan: Botanical and Horticultural Records

Generated from PRD.md on 2 October 2026.
Each item maps to one GitHub issue on Mission Control.

## Phase 1 — Foundation

1. **Project setup: static export and cPanel deploy** (done in PR #1)
   Shared commands, `output: 'export'` with basePath `/botany`, deploy workflow, `plant-records.json` in `public/`.
   *Acceptance:* CI green; `npm run build` produces `out/` with `plant-records.json`.

2. **Connect the deploy to cPanel**
   Add the `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` secrets and confirm the first upload.
   *Acceptance:* `dannychambers.co.uk/botany/` serves the build and `/botany/plant-records.json` returns the data. (Needs Danny for the secrets.)

3. **Record schema, types and data loader**
   TypeScript types for a record and the file; add `project` to every record and a `schema_version` to the file; a typed loader in `src/lib/records.ts` used at build time.
   *Acceptance:* all 21 records load with no `any`; records sort by date then number.

4. **Data validation in CI**
   A Vitest test that validates `plant-records.json` against the schema: required fields, unique record numbers, ISO dates, only allowed inline tags.
   *Acceptance:* a malformed file fails CI; the current file passes.

## Phase 2 — Brand & Design

5. **Design tokens and typography** (reads PRD.md brand section for all decisions)
   Paper, ink and one accent as tokens for light and dark; serif text face and small-capital label style; fonts registered in `.storybook/preview.ts` and `preview-head.html`.
   *Acceptance:* tokens in `globals.css`; a Storybook page shows type scale and colours in both themes; contrast meets WCAG AA.

6. **Site shell: header, footer, theme switch**
   Title "Botanical and Horticultural Records", "D.C. Chambers", links to Index and About; replaces the starter header and footer.
   *Acceptance:* correct at 375px first; keyboard reachable; stories for each.

## Phase 3 — Features

7. **Record field components**
   `RecordField` (label and value, blank state shown as blank), `TaxonName` (italic names, upright authority and cultivar), rendering of inline name markup from the data.
   *Acceptance:* stories for filled, blank and long values; no raw HTML injection beyond the allowed tags.

8. **Record page**
   `/records/{no}/` generated for every record with `generateStaticParams`; all fields in the fixed order; previous and next links; per-record page title.
   *Acceptance:* all 21 pages export; blanks visible; readable at 375px.

9. **Print stylesheet for the record page**
   One A4 sheet per record with a binding margin; ruled lines for blank fields; site chrome hidden.
   *Acceptance:* a Playwright test renders a record to PDF and asserts one page.

10. **POWO links**
    Add an optional `powo_url` to each record and fill it for the 21 existing records where a taxon page exists; show it on the record page.
    *Acceptance:* links open the correct taxon; records without one show nothing.

11. **Index page**
    List of all records, newest work day first: number, name, family, date, site. Each row links to its record.
    *Acceptance:* readable at 375px with no horizontal scroll; works without JavaScript.

12. **Search and filters**
    Search by name; filters for site and family, then project and date range. State kept in the URL hash so a filtered view can be shared.
    *Acceptance:* unit tests for the filter logic; result count announced to screen readers.

13. **Summary accordion**
    Collapsed by default on the index: records by family, timeline of work days, native ranges.
    *Acceptance:* closed on load; keyboard operable; counts match the data.

14. **About page**
    The conventions: what each field means, the authorities used (POWO, IPNI, RHS), how blanks and provisional names are shown.
    *Acceptance:* copy approved by Danny.

15. **Print a set of records**
    Print all records, or the current filtered set, in one job, one sheet per record.
    *Acceptance:* printing the full set yields one page per record.

## Phase 4 — Launch readiness

16. **Accessibility audit**
    Run `/audit-a11y`; fix findings.
    *Acceptance:* WCAG 2.1 AA with no open criticals.

17. **Metadata, 404 and performance**
    Page titles and descriptions, Open Graph, favicon, a 404 page that works under `/botany`; check Core Web Vitals.
    *Acceptance:* LCP under 2.5s on mobile; 404 served by cPanel for unknown paths.

18. **Record-update runbook**
    A short section in CLAUDE.md on how Claude adds or amends a record: edit the JSON, run validation, open a PR.
    *Acceptance:* a new record added by following only the runbook deploys correctly.

## Later (not ticketed yet)
- Photographs per record, stored as files in the repo.
- Dated additions log per record.
- Map of native ranges.
