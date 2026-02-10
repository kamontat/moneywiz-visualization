# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-10
**Commit:** db5c576
**Branch:** main

## OVERVIEW

SvelteKit 2 + Svelte 5 static site for visualizing MoneyWiz CSV exports.
Uses Tailwind CSS 4 + DaisyUI 5, IndexedDB persistence, and Chart.js
for analytics and dashboard charts.

## STRUCTURE

```
moneywiz-visualization/
├── src/
│   ├── routes/           # SvelteKit file-based routing (+page.svelte, +layout.svelte)
│   ├── components/       # Atomic Design: atoms/molecules/organisms (see AGENTS.md)
│   ├── lib/              # Domain modules: analytics/csv/charts/themes/transactions/etc.
│   ├── utils/            # Data layer: db, stores, states, types (see AGENTS.md)
│   └── css/              # Global styles (Tailwind + DaisyUI config)
├── e2e/                  # Playwright E2E tests
├── static/               # Static assets, demo data
└── .github/workflows/    # GitHub Pages deployment
```

## WHERE TO LOOK

| Task               | Location                                      | Notes                                                    |
| ------------------ | --------------------------------------------- | -------------------------------------------------------- |
| Add new page       | `src/routes/`                                 | Create `+page.svelte`, optionally `+page.ts` for load    |
| Add UI component   | `src/components/atoms\|molecules\|organisms/` | Follow atomic design                                     |
| Add business logic | `src/lib/{domain}/`                           | analytics, charts, csv, themes, transactions, formatters |
| Add persistence    | `src/utils/stores/` + `src/utils/db/`         | Schema-first, see utils AGENTS.md                        |
| Add chart adapter  | `src/lib/charts/adapters/`                    | Convert analytics output to Chart.js data                |
| Add E2E test       | `e2e/*.spec.ts`                               | Playwright, webServer auto-builds                        |
| Add unit test      | `src/lib/**/*.spec.ts`                        | Vitest, colocated with source                            |

## CONVENTIONS

### Path Aliases (svelte.config.js)

- `$lib` → `src/lib` (SvelteKit default)
- `$components` → `src/components`
- `$utils` → `src/utils`
- `$css` → `src/css`

### Import Order (ESLint enforced)

```typescript
import type { ... } from '...'     // 1. Types first
import { ... } from 'svelte'       // 2. Builtin/external
import { ... } from '$lib/...'     // 3. Internal aliases
import { ... } from './...'        // 4. Relative
```

### Type Import Convention (MANDATORY)

**All types must be imported from `*/models` paths only.**

```typescript
// ✅ CORRECT - import types from */models
import type { ParsedTransaction } from '$lib/transactions/models'
import type { CsvRow } from '$lib/csv/models'
import type { TransformBy } from './models'

// ❌ WRONG - never import types from package index
import type { ParsedTransaction } from '$lib/transactions'
import type { CsvRow } from '$lib/csv'
```

**Rules:**

1. **Domain `index.ts`** (e.g., `$lib/csv/index.ts`) — export functions only, NO type re-exports
2. **`models/index.ts`** — CAN use barrel exports to aggregate types within the folder
3. **Types belong in `models/`** — never define types in implementation files

**Structure:**

```
src/lib/{domain}/
├── index.ts              # Functions only, no type exports
├── models/
│   ├── index.ts          # Barrel: export * from './foo'
│   ├── foo.ts            # Type definitions
│   └── bar.ts            # Type definitions
└── implementation.ts     # Imports types from './models'
```

### Component Props Pattern

```typescript
type Props = BaseProps & VariantProps<Variant> & ElementProps<'button'>
let {
	variant = 'primary',
	children,
	class: className,
	...rest
}: Props = $props()
```

### Svelte 5 Runes

- Use `$state()`, `$derived()`, `$effect()`, `$props()`
- Render children: `{@render children?.()}`

### DaisyUI Classes

- Prefixed with `d-` (e.g., `d-btn`, `d-btn-primary`)
- Configured in `src/css/global.css`

### Formatting

- Tabs (not spaces)
- No semicolons
- Single quotes
- 80 char line width

## ANTI-PATTERNS

| Pattern                      | Why Forbidden                              |
| ---------------------------- | ------------------------------------------ |
| `as any`, `@ts-ignore`       | Type safety; fix the type instead          |
| Empty `catch(e) {}`          | Always handle or log errors                |
| Direct localStorage for data | Use `src/utils/stores` with DB abstraction |
| Editing `.svelte-kit/*`      | Generated; changes overwritten             |

## KNOWN ISSUES (TODOs in code)

| Location                     | Issue                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `src/lib/transactions/db.ts` | TODO: implement transaction storage initialization          |
| `src/css/global.css`         | FIXME: remove workaround after daisyui PR `#4373` is merged |

## COMMANDS

```bash
# Development
bun install              # Install deps (uses Bun)
bun run dev              # Start dev server

# Quality
bun run check            # Format + lint + svelte-check
bun run fix              # Auto-fix format + lint

# Testing
bun run test:unit        # Vitest unit tests
bun run test:coverage    # Vitest with coverage
bun run test:e2e         # Playwright E2E (builds first)
bun run test             # Both

# Build
bun run build            # Production build → ./build/
bun run preview          # Preview production build
```

## TESTING

- **Unit tests**: Vitest, colocated as `*.spec.ts` next to source
- **Component tests**: `*.svelte.spec.ts`, run in browser via Playwright provider
- **E2E tests**: `e2e/*.spec.ts`, Playwright with auto webServer
- Config split: `vite.config.ts` defines `server` (Node) and `client` (browser) projects
- E2E config: `playwright.config.ts` runs `bun run build && bun run preview` on port `4173`

## DEPLOYMENT

- Static site via `@sveltejs/adapter-static`
- GitHub Actions → GitHub Pages
- `BASE_PATH` set to repo name for subpath hosting

## NOTES

- **Bun required**: Scripts use `bun run`; npm/pnpm work for individual commands
- **IndexedDB + localStorage triggers**: Cross-tab sync via storage events
- **Prerendered**: All routes have `prerender = true`
- **Thai locale default**: Amount formatting uses `th-TH` locale
- **Verification workflow**: Always run `bun run fix` then `bun run check` for full validation (format → lint → svelte-check)
