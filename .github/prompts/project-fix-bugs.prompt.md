---
name: "mw.project-fix-bugs"
description: "Fix bugs and create resilient Playwright tests for regressions"
agent: "agent"
tools: ["execute", "read", "edit/editFiles", "search", "web/fetch", "svelte/*", "microsoft/playwright/*"]
argument-hint: "briefly describe the bug, page, or failing flow"
model: Claude Opus 4.5 (copilot)
---

## Mission

Deliver reliable fixes and Playwright tests that prevent regressions while minimizing impact on product code.

## Scope & Preconditions

- Focus: E2E flows, failing scenarios, and test flakiness related to UI interactions.
- Preconditions: provide URL (or route), reproduction steps, and any required credentials or feature flags.

## Inputs

- Short bug description (what fails, expected vs actual).
- Reproduction steps or failing test name.
- Environment (local/dev/staging) and any relevant logs or screenshots.

## Workflow

1. Explore: Reproduce the issue manually or with Playwright MCP and capture snapshots/logs.
2. Design: Define a minimal, robust test case that reproduces the failure using role-based locators.
3. Implement: Add or update a TypeScript Playwright spec under `e2e/` with `test.step()` grouping and web-first assertions.
4. Run & Iterate: Execute the test, diagnose failures using snapshots/logs, refine locators or test flow (avoid expanding timeouts).
5. Document: Summarize what was fixed, add follow-up notes (flaky indicators, edge cases), and propose extra cases if needed.

## Output Expectations

- A passing Playwright spec that reliably reproduces the fixed behavior (file in `e2e/` following naming `<feature>.spec.ts`).
- A short changelog note describing the fix and any test-only helpers added.
- If code changes were required, include clear reasoning and a minimal diff.

## Quality Checklist

- Use semantic locators: `getByRole`, `getByLabel`, `getByText` where possible.
- Use auto-retrying, web-first assertions like `await expect(locator).toHaveText()`.
- Avoid `page.waitForTimeout()` and hard-coded sleeps.
- Add `test.step()` to make the test readable and debuggable.
- Keep tests focused: one failing scenario per spec.

## Example Test Snippet

```typescript
import { test, expect } from "@playwright/test";

test("Feature - reproduces bug X and stays stable", async ({ page }) => {
  await test.step("Navigate to page", async () => {
    await page.goto("/path");
  });

  await test.step("Perform action", async () => {
    await page.getByRole("button", { name: "Submit" }).click();
  });

  await test.step("Assert outcome", async () => {
    await expect(page.getByRole("status")).toHaveText("Success");
  });
});
```

## When To Ask Questions

- Missing reproduction steps, credentials, or an environment to run tests locally.
- If a fix would require invasive product changes — propose options and ask for approval.

## Final Notes

Keep changes minimal and test-focused. When in doubt, prefer adding a test and a short mitigation note over large product refactors.
