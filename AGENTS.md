# MoneyWiz Visualization

SvelteKit-based web application for visualizing MoneyWiz financial data exports.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun test                           # All tests (unit + e2e)
bun vitest run --project=server    # Server-side unit tests
bun vitest run --project=client    # Svelte component tests
bun run test:e2e                   # E2E tests only

# Build for production
bun run build
bun run preview                    # Preview production build
```

**Note:** Always use `bun` as package manager (not `npm`, `npx`, or `bunx`).

## Recent Updates (Jan 2026)

- **Income vs Expenses Chart:** New donut chart showing income/expense ratio with savings rate indicator, gradient fills, and detailed legend
- **No Auto-Load CSV:** Dashboard no longer auto-loads `data/report.csv`; users must explicitly upload CSV files (test data is for local development only)
- **Clear CSV Feature:** Header now includes a clear button to reset loaded data and start fresh
- **Compact Header:** Reduced header padding and font sizes for a more compact appearance
- **Dashboard Refactoring:** Split monolithic +page.svelte into reusable components (SummaryCards, TopCategoriesChart, DailyExpensesChart) and extracted business logic to `src/lib/analytics.ts` and `src/lib/finance.ts`
- **Path Alias:** Added `$components` alias in svelte.config.js for cleaner imports
- **Dashboard:** THB-only summary cards + charts (Top Categories, Daily Expenses). Reacts to CSV uploads via `csvStore`
- **Debug Logging:** Builder API in `src/lib/debug.ts`. Enable with `DEBUG=moneywiz:*` or `localStorage.debug = 'moneywiz:*'`
- **CSV Handling:** Parser handles MoneyWiz `sep=` preamble, BOM, throws `CsvParseError` on failures
- **Svelte 5 Migration:** Event attributes (`onchange`), `$derived()`, `$effect()` - no deprecation warnings

## Project Structure

```
src/
  components/      # UI components (AppHeader, MoneyLogo, CsvUploadButton, SummaryCards, TopCategoriesChart, DailyExpensesChart, IncomeExpenseRatioChart)
  lib/             # Business logic (csv.ts, analytics.ts, finance.ts, debug.ts, stores/)
  routes/          # SvelteKit routes (file-based routing)
static/            # Static assets (copied to build/)
e2e/               # Playwright e2e tests
.github/
  instructions/    # Custom instructions (auto-applied by file pattern)
  skills/          # Reusable skills (invoke as needed)
  prompts/         # Custom prompts (invoke with /)
```

## Development Guidelines

### File Organization

- **UI Components:** Place in `src/components/` - Keep focused and reusable
- **Business Logic:** Place in `src/lib/` - Separate from UI concerns
- **Tests:** Co-locate with source files using `.spec.ts` suffix
- **Routes:** SvelteKit file-based routing in `src/routes/`
- **Minimal Route Files:** Keep `src/routes/*.svelte` and `src/routes/*.ts` files as small as possible. Move all business logic to `src/lib/` and reusable UI/design components to `src/components/`

### Code Structure

- **No Single-File Implementations:** Keep UI, logic, and tests separated
- **Component vs Logic Separation:** Components in `src/components/`, logic in `src/lib/`
- **Keep Files Small:** Each file should have a single, clear responsibility

### Path Aliases

The project uses SvelteKit path aliases configured in `svelte.config.js`:

- `$lib` → `src/lib/` (built-in SvelteKit alias)
- `$components` → `src/components/` (custom alias for cleaner imports)

Example usage:
```svelte
<script lang="ts">
  import SummaryCards from '$components/SummaryCards.svelte';
  import { parseCsv } from '$lib/csv';
</script>
```

## Deployment Configuration

### Static Site Generation

- **Domain:** https://moneywiz.kamontat.net/
- **Adapter:** `@sveltejs/adapter-static` for root-level deployment
- **Prerendering:** All pages prerendered via `export const prerender = true` in `src/routes/+layout.ts`
- **No Base Path:** Site deploys to custom domain root (no `paths.base` needed)

### Image Handling

Images imported from `$lib/images/` are automatically processed by Vite:
- Hashed and placed in `build/_app/immutable/assets/`
- Paths resolved as absolute from root
- No manual path resolution needed

```svelte
<script lang="ts">
  import welcome from '$lib/images/svelte-welcome.webp';
</script>
<img src={welcome} alt="Welcome" />
```

### Service Worker

Empty service worker at `static/sw.js` prevents SvelteKit client-side 404 errors. It's copied to `build/sw.js` during build.

## Common Issues & Solutions

### Dev Server Management

Before starting dev server, check http://localhost:5173/ to reuse existing instance. Avoid launching `bun run dev` if already running to prevent port conflicts.

### MoneyWiz CSV Format

MoneyWiz exports include a leading `sep=` line. Parser honors this and skips the preamble automatically. UI shows preview after successful parse.

### Debug Logging

Enable debug logs with:
- **Terminal:** `DEBUG=moneywiz:* bun run dev`
- **Browser:** `localStorage.debug = 'moneywiz:*'` (then refresh)
- **Namespaces:** `moneywiz:csv`, `moneywiz:store:csv`, etc.
- **All libs:** `DEBUG=*` or `localStorage.debug = '*'`

Implemented via `src/lib/debug.ts` with fluent builder API:
```typescript
const log = createLogger('module').sub('feature').build();
```

### Svelte 5 Event Syntax

- Use event attributes: `onchange`, `onclick` (not `on:change`, `on:click`)
- Use `$derived()` for reactive computed values
- Use `$effect()` for side effects
- Reference: [CsvUploadButton.svelte](src/components/CsvUploadButton.svelte)

## Available Assets

### Instructions (Auto-Applied)
- **mcp-tools** - MCP tools usage (Svelte, Context7, DeepWiki, Playwright, and more)
- **svelte** - Svelte 5 and SvelteKit best practices
- **playwright-typescript** - Playwright test generation
- **nodejs-javascript-vitest** - Node.js testing with Vitest

### Skills (Invoke as Needed)
- **git-commit** - Intelligent git commit with staging and conventional messages
- **chrome-devtools** - Browser automation and debugging via Chrome DevTools MCP

### Prompts (Use with `/`)
- **/mw.project-archive** - Summarize session, update docs, and commit changes
- **/mw.project-explore-ui** - Explore website and identify key user flows for testing
- **/mw.project-fix-bugs** - Fix bugs and create Playwright tests for regressions
- **/mw.project-implement** - Implement website features with SvelteKit and Playwright
- **/mw.project-test-ui** - Generate Playwright tests from scenario using live browser

See `.github/instructions/`, `.github/skills/`, `.github/prompts/` for full details.