# Conventional Commit Guide

Use this guide when drafting commit headers for this skill.

## Header format

Use one of:

- `<type>(<scope>): <subject>`
- `<type>: <subject>`

Write `<subject>` in imperative form and keep it concise.

## Types

- `feat`: Add or expand user-visible functionality.
- `fix`: Correct incorrect behavior.
- `refactor`: Improve internal structure without behavior change.
- `perf`: Improve performance behavior.
- `test`: Add or update tests.
- `docs`: Update documentation only.
- `build`: Change build tooling or dependency wiring.
- `ci`: Change CI/CD configuration.
- `chore`: Maintenance work not covered above.

## Scope guidance

Use a short scope when it improves clarity.

Examples:

- `feat(charts): add monthly expense trend comparison`
- `fix(csv): handle quoted commas in parser`
- `refactor(transactions): simplify category aggregation`

## Splitting heuristics

Split into separate commits when any of these are true:

- The changes can be described with different commit types.
- Files touch different subsystems with independent intent.
- One part can be reverted independently without breaking the other.
- A reviewer would likely comment on different concerns.

Keep a single commit when all changed files are required for one
feature/fix and cannot be reviewed independently.
