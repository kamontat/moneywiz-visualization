---
name: common-conventional-commits
description: 'Execute git commit with conventional commit message analysis, intelligent staging, and message generation for MoneyWiz SvelteKit projects. Use when user asks to commit changes, create a git commit, or mentions "/commit". Supports: (1) Auto-detecting type and scope from changes, (2) Generating conventional commit messages from diff, (3) Interactive commit with optional type/scope/description overrides, (4) Intelligent file staging for logical grouping'
license: MIT
---

# Git Commit with Conventional Commits

## Overview

Create standardized, semantic git commits using the Conventional Commits specification. Analyze the actual diff to determine appropriate type, scope, and message.

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

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

## MoneyWiz Project Scopes

Common scopes for this SvelteKit project:

| Scope                | Files Affected                                              |
| -------------------- | ----------------------------------------------------------- |
| `csv`                | CSV upload flow, CSV parser, `src/lib/csv.ts`, CSV handling |
| `charts`             | Chart components (`DailyExpensesChart`, etc.)               |
| `dashboard`          | Main dashboard (`src/routes/+page.svelte`)                  |
| `header`             | `AppHeader.svelte`, navigation, clear button                |
| `analytics`          | Business logic, `src/lib/analytics.ts`, calculations        |
| `store`              | State management, `src/lib/stores/csv.ts`                   |
| `styling`            | Tailwind CSS, component styles                              |
| `test`               | Unit tests (`.spec.ts` files)                               |
| `e2e`                | Playwright tests in `e2e/` directory                        |
| `config`             | All kinds of configuration                                  |

## Breaking Changes

```
# Exclamation mark after type/scope
feat!: remove deprecated endpoint

# BREAKING CHANGE footer
feat: allow config to extend other configs

BREAKING CHANGE: `extends` key behavior changed
```

## Workflow

### 1. Analyze Diff

```bash
# If files are staged, use staged diff
git diff --staged

# If nothing staged, use working tree diff
git diff

# Also check status
git status --porcelain
```

### 2. Stage Files (if needed)

If nothing is staged or you want to group changes differently:

```bash
# Stage specific files
git add path/to/file1 path/to/file2

# Stage by pattern
git add *.test.*
git add src/components/*

# Interactive staging
git add -p
```

**Never commit secrets** (.env, credentials.json, private keys).

### 3. Generate Commit Message

Analyze the diff to determine:

- **Type**: What kind of change is this?
- **Scope**: What area/module is affected?
- **Description**: One-line summary of what changed (present tense, imperative mood, <72 chars)

### 4. Execute Commit

```bash
# Single line
git commit -m "<type>[scope]: <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## MoneyWiz Commit Examples

```
# Add new chart component
feat(charts): add income vs expense ratio visualization

# Fix CSV parsing issue
fix(csv): handle MoneyWiz sep= preamble correctly

# Update analytics calculation
feat(analytics): add savings rate calculation to summary

# Add E2E test for CSV upload
test(e2e): add test for CSV upload and dashboard update

# Refactor component structure
refactor(dashboard): extract chart rendering to separate components

# Update Tailwind styling
style(header): reduce padding for compact appearance
```

## Best Practices

- One logical change per commit
- Present tense: "add" not "added"
- Imperative mood: "fix bug" not "fixes bug"
- Use appropriate scope from the MoneyWiz scope list
- Reference issues: `Closes #123`, `Refs #456`
- Keep description under 72 characters
- Always use `bun` for package operations (never `npm`)

## Git Safety Protocol

- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless user asks
- NEVER force push to main/master
- If commit fails due to hooks, fix and create NEW commit (don't amend)
