# Validation Checklist

Use this checklist when running `$result-validation`.

## Core Requirements

1. Pass existing unit and E2E tests.
2. Confirm new feature or bug fix has automated coverage.
3. Pass `bun run fix` and `bun run check` with no errors.
4. Pass `bun run build`.
5. Validate behavior with Playwright in a real browser.

## Command Sequence

```bash
bash ./.agents/skills/result-validation/scripts/check_automation_coverage.sh
bun run fix
bun run check
bun run build
bun run test:unit
```

## Targeted Commands

```bash
bun run test:unit <path-to-spec>
bun run test:e2e -- <path-to-e2e-spec>
# or full suite
bun run test:e2e
```

## Playwright Validation Notes

1. Reproduce exact user steps for the changed behavior.
2. Confirm expected UI state after each critical interaction.
3. Capture at least one screenshot or trace artifact.
4. Include artifact path(s) in the final report.
