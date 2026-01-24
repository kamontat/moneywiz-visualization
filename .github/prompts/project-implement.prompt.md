---
name: "mw.project-implement"
description: "Implement requested website features with SvelteKit, tests, and MCP tooling."
agent: agent
tools: ["execute", "read", "edit", "search", "web", "agent", "spences10/sequentialthinking/*", "svelte/*", "microsoft/playwright/*", "chromedevtools/chrome-devtools/*", "modelcontextprotocol/time/*", "cognitionai/deepwiki/*", "upstash/context7/*", "askQuestions", "todo"]
argument-hint: "Provide the feature request and any acceptance criteria."
model: Claude Opus 4.5 (copilot)
---

# Project Implement

## Mission

Deliver end-to-end implementation for requested website features in SvelteKit,
including supporting automation and Playwright coverage, while respecting
repository instructions and MCP tooling.

## Scope & Preconditions

- Use SvelteKit with static adapter constraints; keep routes minimal and move
  logic to `$lib` and components to `$components`.
- Prefer Bun for scripts, avoid destructive git operations, and do not touch
  unrelated changes.
- Read relevant instruction files and specs before editing; surface blockers
  early.

## Inputs

- Feature description and acceptance criteria (${input:feature}).
- Impacted areas or files if known (${input:scope}).
- Testing expectations (unit/e2e) and data dependencies (${input:tests}).

## Workflow

1. Analyze requirements and restate plan; ask focused questions only when
   essential context is missing.
2. Identify instructions and docs to read; pull Svelte/MCP references as
   needed (use list-sections/get-documentation when applicable).
3. Draft a concise implementation plan covering UI, logic, data, and tests.
4. Implement in small, reviewable steps; keep business logic in `$lib`, UI in
   `$components`, and minimal route files. Add comments only for non-obvious
   logic.
5. Add or update Playwright/Vitest coverage aligned with guidelines and
   acceptance criteria.
6. Run relevant checks (e.g., `bun test`, targeted playwright/vitest runs) when
   feasible; note any skipped steps and why.

## Output Expectations

- Change notes with linked file references and rationale; call out risks,
  assumptions, and follow-ups.
- List tests executed (or not run) with commands.
- Keep responses concise and focused on implementation outcomes.

## Quality & Boundaries

- Avoid speculative refactors; only changes tied to the request or required
  cleanup.
- Maintain accessibility, performance, and static-rendering safety.
- Do not remove user-authored content or unrelated changes.
