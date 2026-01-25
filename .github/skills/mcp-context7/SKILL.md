---
name: mcp-context7
description: Retrieve up-to-date, version-specific documentation and code examples for any library using the Context7 MCP server. Use when you need authoritative information on external libraries (e.g., TailwindCSS, Chart.js, SvelteKit).
---

# Library Documentation (Context7)

This skill enables you to access real-time, accurate documentation for external libraries and frameworks used in this project.

## When to Use This Skill

- When using a new library for the first time.
- When you need up-to-date, version-specific API references (e.g., "How to use Tailwind v4 utilities?").
- When you encounter unexpected behavior in a third-party package.
- When you need modern code examples that follow the latest library best practices.

## Workflow

### 1. Resolve Library ID
First, find the correct ID for the library you want to query.
- Use `resolve-library-id` with the library name (e.g., "tailwindcss", "sveltekit", "vitest").
- This ensures you are using the precise ID recognized by the Context7 index.

### 2. Query Documentation
Once you have the ID, use `query-docs` to retrieve information.
- Provide the `libraryId`.
- Ask a specific question or request an API reference.

**Example Process:**
1. Call `resolve-library-id(query: "tailwindcss")` -> Returns `"tailwindcss"`.
2. Call `query-docs(libraryId: "tailwindcss", query: "How to configure dark mode in v4?")`.

## Best Practices

- **Be Specific**: Instead of asking "How to use this?", ask "How to implement [specific feature] in [library name] [version]?".
- **Version Awareness**: If you know the version (e.g., Tailwind v4), mention it in your query for more accurate results.
- **Combined with Svelte Skill**: Use these docs alongside the `svelte` skill to ensure library integrations follow Svelte 5 patterns.

---

**Note:** An API key is optional but increases rate limits. If needed, manage it at [https://context7.com/dashboard](https://context7.com/dashboard).
