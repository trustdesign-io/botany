# [Project Name]

> Replace everything in square brackets before using this template.

## Project Overview
[One paragraph: what this project does, who it's for, core value proposition.]

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| State (client) | Zustand |
| Testing | Vitest + Playwright + React Testing Library |
| Deployment | Vercel |

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
| Vercel dashboard | [link] |
| Figma designs | [link] |
| GitHub repo | [link] |
| Linear / project board | [link] |
