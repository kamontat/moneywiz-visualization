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

## Available Assets

### Instructions (Auto-Applied)
- **agents** - Guidelines for creating custom agent files for GitHub Copilot
- **instructions** - Guidelines for creating high-quality custom instruction files
- **prompt** - Guidelines for creating high-quality prompt files
- **skills** - Guidelines for creating high-quality Agent Skills

### Skills (Invoke as Needed)
- **commit-github-actions** - Comprehensive guide for building robust, secure, and efficient CI/CD pipelines using GitHub Actions
- **common-conventional-commits** - Execute git commit with conventional commit message analysis, intelligent staging, and message generation
- **common-documentation** - Standards for creating and maintaining high-quality Markdown documentation
- **common-svelte** - Comprehensive Svelte 5 and SvelteKit development guide
- **common-troubleshooting** - Comprehensive troubleshooting guide for the MoneyWiz Visualization project
- **mcp-chromedevtools** - Guideline for browser automation and debugging via Chrome DevTools MCP
- **mcp-context7** - Retrieve up-to-date documentation and code examples for any library using Context7
- **mcp-playwright** - Guideline for browser automation and testing via Playwright MCP
- **mcp-sequential-thinking** - Systematic problem-solving and reasoning via Sequential Thinking MCP
- **mcp-time** - Get current date, time, and timezone information
- **web-designer** - Visual inspection and design validation for MoneyWiz UI
- **web-e2e-tester** - Comprehensive guide for end-to-end testing with Playwright
- **web-unit-tester** - Expert-level guide for unit testing using Vitest

### Prompts (Use with `/`)
- **openspec-apply** - Implement an approved OpenSpec change and keep tasks in sync
- **openspec-archive** - Archive a deployed OpenSpec change and update specs
- **openspec-proposal** - Guide the user through creating a new OpenSpec change proposal
- **project.archive** - Archive work session—review, fix errors, update docs, archive OpenSpec changes, and commit
- **project.implement** - Implement an approved OpenSpec change with full SvelteKit integration and testing
- **project.proposal** - Guide the user through creating a new OpenSpec change proposal

See `.github/instructions/`, `.github/skills/`, `.github/prompts/` for full details.
