# Project Context

## Purpose
SvelteKit-based web application for visualizing MoneyWiz financial data exports. The goal is to provide a local-first, secure way to analyze personal finance data exported from the MoneyWiz application without sending data to external servers.

## Tech Stack
- **Framework**: Svelte 5, SvelteKit (Static Adapter)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Build Tool**: Vite
- **Runtime & Package Manager**: Bun
- **Testing**: Vitest (Unit/Component), Playwright (E2E)

## Project Conventions

### Code Style
- **Svelte 5**: Use Runes syntax (`$state`, `$derived`, `$effect`) and standard event attributes (`onclick`, `onchange`).
- **File Organization**:
  - UI Components: `src/components/` (use `$components` alias)
  - Business Logic: `src/lib/` (use `$lib` alias)
  - Routes: `src/routes/` (keep minimal, move logic to `$lib`)
- **Separation of Concerns**: Avoid large single files. Separate UI, logic, and tests.
- **Import Aliases**:
  - `$lib` → `src/lib/`
  - `$components` → `src/components/`

### Architecture Patterns
- **Static Site Generation (SSG)**: Uses `@sveltejs/adapter-static` with full prerendering (`export const prerender = true`).
- **Local-First**: Data processing happens in the browser; no backend database.
- **Component Architecture**: Reusable UI components separated from business logic.

### Testing Strategy
- **Unit Tests**: Vitest with Node environment for logic in `src/lib/`.
- **Component Tests**: Vitest with Playwright browser provider for `*.svelte` components.
- **E2E Tests**: Playwright for full application flows in `e2e/`.
- **Co-location**: Test files (`.spec.ts`) sit next to the source files they test.

### Git Workflow
- **Commit Messages**: Conventional Commits format (feat, fix, docs, style, refactor, test, chore).
- **Environment**: Use `bun` for all script executions.

## Domain Context
- **MoneyWiz CSV**: The application parses CSV files exported from MoneyWiz. These files typically contain a `sep=` line at the beginning which must be handled/skipped by the parser.
- **Privacy**: Financial data is sensitive. The application runs entirely client-side to ensure privacy.

## Important Constraints
- **Package Manager**: Must use `bun`. Do not use npm/yarn/pnpm.
- **Deployment**: Deploys to `https://moneywiz.kamontat.net/` as a static site.
- **Browser Capability**: Relies on modern browser features for client-side data processing.

## External Dependencies
- **UI/Visuals**: `@neoconfetti/svelte`, `tailwindcss`
- **Testing**: `@playwright/test`, `vitest`
- **Utils**: `debug` (for namespaced logging)
