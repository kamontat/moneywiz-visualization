---
name: result-validation
description: Validate feature and bug-fix changes before commit in Bun/Svelte projects. Use when asked to verify a result end-to-end, confirm tests/build quality gates, or prove a UI bug fix via Playwright. This skill enforces fix/check/build/test, verifies automated test coverage for changed behavior, and performs targeted Playwright validation.
---

# Result Validation

Run this workflow after implementing a feature or bug fix.

## 1) Map changed behavior

1. Inspect changed files:

```bash
git diff --name-only
```

2. Define expected behavior for each change in one sentence.
3. Mark each change as logic-only, UI-only, or both.

## 2) Ensure automated test coverage

1. Confirm existing tests already cover each expected behavior.
2. Add or update tests when coverage is missing.
3. Prefer these locations:

- `src/**/*.spec.ts`
- `src/**/*.svelte.spec.ts`
- `e2e/*.spec.ts`

4. Run targeted tests first:

```bash
bun run test:unit <path-to-spec>
bun run test:e2e -- <path-to-e2e-spec>
```

5. Use `scripts/check_automation_coverage.sh` for a fast coverage hint.

## 3) Run repository quality gates

Run:

```bash
./scripts/run_quality_gate.sh
```

This executes in order:

1. `bun run fix`
2. `bun run check`
3. `bun run build`
4. `bun run test`

## 4) Validate behavior with Playwright

Run Playwright verification for user-visible changes:

1. Execute targeted E2E spec(s) when available.
2. Reproduce the changed flow in a real browser.
3. Confirm the fixed behavior or new feature is visible and correct.
4. Capture evidence (`screenshot` or trace) for the verification report.

Use `$playwright` when interactive browser steps are needed.

## 5) Report completion

Return:

1. Commands executed
2. Status for fix/check/build/unit/e2e
3. Added or updated tests
4. Playwright verification evidence paths
5. Remaining risks or follow-ups

## References

- Checklist and command snippets: `references/validation-checklist.md`
