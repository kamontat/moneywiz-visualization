# Constitution

Rules that AI agents **must always respect** when working in this repository.

## Package Manager

- **Use `bun` exclusively** — Never use `npm`, `npx`, or `bunx`
- Run commands with `bun run <script>` or `bun <command>`

## Code Style

- **TypeScript required** — All source files use strict TypeScript
- **Svelte 5 Runes** — Use `$state`, `$derived`, `$effect` (never legacy `$:` syntax)
- **Atomic Design** — Components follow atomic structure:
  - `src/components/atoms/` — Basic building blocks
  - `src/components/molecules/` — Simple combinations
  - `src/components/organisms/` — Complex UI sections
- **File naming** — Use PascalCase for Svelte components, camelCase for utilities
- **Imports** — Use `$lib/` alias for library imports

## Validation

**MANDATORY:** After modifying ANY code, you MUST:

1. **Run `bun run fix`** — Auto-fix formatting and linting issues
2. **Run `bun run check`** — Validate formatting, linting, and types
3. If `bun run check` reports errors, you MUST fix them before finishing. Do not ignore type errors or lint warnings.

## Testing

- **Co-located tests** — Unit tests live next to source files as `.spec.ts`
- **Vitest** — Use for unit tests (`bun run test:unit`)
- **Playwright** — Use for E2E tests in `e2e/` directory (`bun run test:e2e`)

## Documentation

- **README.md** — Keep updated with features and usage
- **Inline comments** — Use JSDoc for public functions
- **Specs** — Document requirements in `.agentic/specs/`

## Git & Commits

- **Conventional Commits** — Use format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Scope: component name, feature area, or omit for broad changes
- **Atomic commits** — One logical change per commit
- **Branch naming** — `feature/`, `fix/`, `docs/` prefixes

## Security

- **No secrets in code** — Use environment variables
- **Sanitize inputs** — Especially CSV data from user uploads
- **No eval** — Never use `eval()` or dynamic code execution

## Project-Specific Rules

- **Currency** — THB is the primary currency for summaries
- **Debug logging** — Use `debug` library with `moneywiz:*` namespace
- **Static deployment** — All pages must be prerenderable
- **Responsive design** — Mobile-first approach required
