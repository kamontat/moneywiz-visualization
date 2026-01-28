---
name: common-conventional-commits
description: Create standardized git commits using the Conventional Commits specification. Use for analyzing diffs, staging files, generating semantic commit messages with correct types/scopes, or when user uses the /commit command.
license: MIT
---

# Conventional Commits

## Format Specification

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Purpose                        |
| ---------- | ------------------------------ |
| `feat`     | New feature                    |
| `fix`      | Bug fix                        |
| `docs`     | Documentation only             |
| `style`    | Formatting/style (no logic)    |
| `refactor` | Code refactor (no feature/fix) |
| `perf`     | Performance improvement        |
| `test`     | Add/update tests               |
| `build`    | Build system/dependencies      |
| `ci`       | CI/config changes              |
| `chore`    | Maintenance/misc               |
| `revert`   | Revert commit                  |

### Project Scopes

| Scope       | Files Affected                                |
| ----------- | --------------------------------------------- |
| `csv`       | CSV upload flow, CSV parser, `src/lib/csv.ts` |
| `charts`    | Chart components (`DailyExpensesChart`, etc.) |
| `dashboard` | Main dashboard (`src/routes/+page.svelte`)    |
| `header`    | `AppHeader.svelte`, navigation                |
| `analytics` | Business logic, `src/lib/analytics.ts`        |
| `store`     | State management, `src/lib/stores/`           |
| `styling`   | Tailwind CSS, component styles                |
| `test`      | Unit tests (`.spec.ts`)                       |
| `e2e`       | Playwright tests in `e2e/`                    |
| `config`    | Configuration files (`vite.config.ts`, etc.)  |

## Breaking Changes

Add `!` after type/scope or `BREAKING CHANGE:` footer.

```
feat!: drop support for Node 16
```

## Workflow Requirements

1.  **Analyze Changes**:
    - Run `git diff --staged` (or `git diff` if nothing staged).
    - Identify logical groups of changes.

2.  **Stage Files**:
    - If needed, stage files intelligently: `git add <path>`.
    - **NEVER** commit secrets or `.env` files.

3.  **Generate Message**:
    - Determine **Type** and **Scope**.
    - Write a short **Description** (imperative mood, <72 chars).

4.  **Commit**:
    - Run `git commit -m "type(scope): description"`.

## Examples

- `feat(charts): add income vs expense ratio visualization`
- `fix(csv): handle MoneyWiz sep= preamble correctly`
- `style(header): reduce padding for compact appearance`
- `test(e2e): add test for CSV upload`

## Safety Directives

- **NEVER** Use `--no-verify`.
- **NEVER** Force push.
- **NEVER** Update git config unless explicitly asked.
- **ALWAYS** Use `bun` for package operations.
