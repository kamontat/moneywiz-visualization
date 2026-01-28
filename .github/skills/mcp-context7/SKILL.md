---
name: mcp-context7
description: Query external library documentation (Tailwind, SvelteKit, etc.) using Context7. Use when you need up-to-date API references, official snippets, or version-aware examples for third-party packages.
---

# Context7 Library Docs

## Workflow

1.  **Resolve ID**: `resolve-library-id(query: "library-name")`.
2.  **Query**: `query-docs(libraryId: "id", query: "users question")`.

## Best Practices

- **Be Specific**: Include the library version if known.
- **Limit Calls**: Don't spam queries. 1-2 calls usually suffice.
- **Synthesize**: Combine the docs with the project's existing code style.

## Supported Libraries (Examples)

- `tailwindcss`
- `svelte` / `sveltekit`
- `vitest`
- `playwright`
