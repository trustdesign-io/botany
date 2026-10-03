# PRD: Botanical and Horticultural Records

**Version:** 1.0
**Date:** 2 October 2026
**Status:** Approved

---

## Overview
A public, read-only website at `dannychambers.co.uk/botany` that displays the botanical and horticultural records kept by D.C. Chambers. Every record lives in one data file, `public/plant-records.json`; the site renders that file and nothing else. It replaces a handwritten record book that could not keep pace with the work.

## Problem Statement
Danny works with new plants faster than he can write them up by hand. Paper records cannot be searched, shared, or read by Claude, and they cannot be shown to anyone who is not holding the book.

## Target Audience
1. **Danny**, looking up his own records on a phone, often in the garden.
2. **People assessing him as a botanist**: the Kew apprenticeship panel, Tom Hart Dyke at Lullingstone, and others who want to see how he records.

## Product Type
Static content site. An open record: no accounts, no sign-in, no admin screen.

## How records are maintained
Danny tells Claude what he worked with. Claude edits `public/plant-records.json` and pushes to GitHub. The deploy workflow rebuilds the site and uploads it. The JSON file is also published at `/botany/plant-records.json` so Claude can read the records in any conversation.

---

## Pages & Routes

All routes sit under the `/botany` base path. There are no authenticated pages; the starter's sign-in, sign-up, password and settings pages do not apply.

| Route | Page | Notes |
|-------|------|-------|
| `/botany/` | Index | Every record: number, name, family, date, site. Search and filters (site, project, family, date). A collapsed accordion holds the summary views, so the default view is a plain list. |
| `/botany/records/{no}/` | Record | One page per record, e.g. `/botany/records/013/`. Every field, in record-book order. Prints as an A4 sheet. Links to the taxon's POWO page. |
| `/botany/about/` | About | The conventions: what each field means (Det., Label read), the authorities used, how blanks are shown. |
| `/botany/plant-records.json` | Data | The source file, served as-is. |

### Record fields, in fixed order
Record no. · Date · Site · Location · VC · Grid
Name · Family · Det. · Label read · Note
Common names · Native range · Habit · Provenance
Diagnostic · Near misses
Work done · Observed
Sources · Open questions

A field with nothing recorded is shown as blank, never omitted, so gaps stay visible.

### Summary views (index accordion, collapsed by default)
- Search and filters
- Records by family
- Native ranges

---

## Brand

### Identity
- **Name:** Botanical and Horticultural Records
- **Kept by:** D.C. Chambers
- **Personality:** scholarly, exact, quiet
- **Tone of voice:** plain and factual, in the style of the record book. No marketing copy.
- **Separate from Sacred Shrubs.** This site is under Danny's own name and shares nothing with that brand.
- **References:**
  - Plants of the World Online (powo.science.kew.org) for the record page: name and authority as the heading, then short labelled facts.
  - Kew Herbarium Catalogue (apps.kew.org/herbcat) for the index: a dense, sortable specimen list with no decoration.
  - JSTOR Global Plants (plants.jstor.org) for the feel of a herbarium sheet, with determination and label text treated as primary evidence.

### Visual direction
- **Colour:** paper ground, black ink, one accent. A dark mode with the same restraint.
- **Typography:** serif for text and names; small-capital, letter-spaced labels. Botanical names in italics, authorities upright, cultivar names in single quotes and upright.
- **Aesthetic:** a herbarium sheet or museum catalogue. Avoid the garden-centre or lifestyle-blog look: no hero photos, green gradients, leaf icons or decorative illustration.

### Design constraints
- Mobile-first, always. Design at 375px first; then 768px, 1024px, 1440px; then print.
- The record page and the printed A4 sheet come from the same component and the same data.
- All interactive elements have hover, focus and active states.
- Custom fonts must be registered in `.storybook/preview.ts` AND `.storybook/preview-head.html`.

---

## Features & Requirements

### Must have (MVP)
- Index of all records, newest work day first, readable at 375px.
- Record page for every record, with all fields in the fixed order and blanks shown.
- Print stylesheet: a record page prints as one A4 sheet with a binding margin.
- About page with the conventions and authorities.
- Search by name, and filters for site and family.
- Link from each record to its POWO taxon page, where one exists.
- Data schema that scales beyond Lullingstone: every record carries `site` and a list of `projects` (none, one or several; a record never appears twice), and the index can filter by both.
- Typed schema and a validation test for `plant-records.json`, so a malformed edit fails CI and never deploys.
- Light and dark themes.

- Three entry types in one list, each with its own number sequence and a Type filter: plants worked with (001…), species studied (S001…) and events attended (E001…). An event lists the species seen inside it.

### Should have
- Index accordion: search and filters, by family, native ranges.
- Filters for project and date range.
- Print all records, or a filtered set, in one job.
- Previous and next links between records.

### Nice to have
- Photographs per record, stored as files in the repo beside the JSON (no database).
- A dated additions log per record, the digital form of red-ink amendments.
- Map of native ranges.

### Out of scope
- Accounts, sign-in, or any editing through the site.
- A database or CMS.
- Analytics.

---

## Technical Requirements
- **Stack:** Next.js (App Router), TypeScript strict, Tailwind, shadcn/ui. No Supabase, no database, no auth.
- **Hosting:** static export (`output: 'export'`, `basePath: '/botany'`) uploaded to cPanel `public_html/botany` by `.github/workflows/deploy.yml`. Not Vercel.
- **Data:** `public/plant-records.json` is the single source of truth, read at build time.
- **Target device:** mobile-first.
- **Third-party integrations:** outbound links to POWO only.
- **Performance targets:** Core Web Vitals green, LCP < 2.5s. Works with JavaScript disabled for reading; search and filters may need it.
- **Accessibility:** WCAG 2.1 AA.

---

## Success Criteria
- [ ] All pages listed above designed and implemented
- [ ] All 21 existing records render correctly, with blanks visible
- [ ] A record page prints as one A4 sheet
- [ ] Adding a record needs only an edit to `plant-records.json` and a push
- [ ] A record from a second site or project appears with no code change
- [ ] Brand tokens applied consistently across all surfaces
- [ ] CI passing (lint, type-check, tests, build)
- [ ] Storybook stories for all components
- [ ] Responsive at all breakpoints
