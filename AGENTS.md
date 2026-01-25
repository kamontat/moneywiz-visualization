<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

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

## Project Structure

```
src/
  components/      # UI components
  lib/             # Business logic
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
- **web-design-reviewer** - Visual inspection and design validation for MoneyWiz UI
- **webapp-testing** - E2E testing toolkit with Playwright and checking CSV workflows

### Prompts (Use with `/`)
- **/mw.project-archive** - Summarize session, update docs, and commit changes
- **/mw.project-explore-ui** - Explore website and identify key user flows for testing
- **/mw.project-fix-bugs** - Fix bugs and create Playwright tests for regressions
- **/mw.project-implement** - Implement website features with SvelteKit and Playwright
- **/mw.project-test-ui** - Generate Playwright tests from scenario using live browser

See `.github/instructions/`, `.github/skills/`, `.github/prompts/` for full details.
