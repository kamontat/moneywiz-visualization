# moneywiz-visualization

Static SvelteKit app for visualizing MoneyWiz SQLite exports.

## Stack

- SvelteKit 2 + Svelte 5
- Tailwind CSS 4 + DaisyUI 5
- Chart.js
- IndexedDB-backed local persistence

## Documentation

- Agent/project guide: [AGENTS.md](AGENTS.md)
- Data parser rules: [docs/DATA_PARSER.md](docs/DATA_PARSER.md)
- SQLite schema reference: [docs/SQLITE_SCHEMA.md](docs/SQLITE_SCHEMA.md)

## Quick start

```bash
bun install
bun run dev
```

## Quality checks

```bash
bun run fix
bun run check
bun run test
```

## Build

```bash
bun run build
bun run preview
```
