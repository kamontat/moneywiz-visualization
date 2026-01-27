# Proposal: integrate-e2e-into-vitest

## Objective

Consolidate E2E tests into Vitest by replacing the separate Playwright test runner with a Vitest project that uses Playwright browser support.

## Description

Currently, the project maintains two separate test configurations: Vitest for unit/component tests and standalone Playwright for E2E tests. This creates unnecessary complexity with multiple test runners, separate configurations, and duplicated dependencies. Since Vitest already has built-in Playwright support through `@vitest/browser-playwright`, we can consolidate all tests under a single test runner. This will simplify the test infrastructure, provide a unified test experience, and allow running all tests through a single command while still maintaining the ability to run different test types separately using Vitest's project feature.

## Acceptance Criteria

- [ ] Standalone Playwright configuration (`playwright.config.ts`) is removed
- [ ] A new Vitest project named "e2e" is added to `vite.config.ts`
- [ ] All E2E tests run successfully through Vitest
- [ ] E2E tests can be run separately with `bun run test:e2e` or `bun vitest run --project=e2e`
- [ ] All tests (unit, component, E2E) can be run with a single `bun run test` command
- [ ] Package.json scripts are updated to use Vitest for E2E tests
- [ ] `@playwright/test` dependency is removed (only `playwright` is needed)
- [ ] README.md is updated with new test commands

## Out of Scope

This plan does not include:
- Converting test syntax from Playwright Test API to Vitest API (tests will remain using Playwright's `test` and `expect`)
- Adding new E2E tests or modifying existing test logic
- Optimizing test performance or parallelization
- Adding test coverage reporting

## References

- [Vitest Browser Mode](https://vitest.dev/guide/browser.html)
- [Vitest Workspace](https://vitest.dev/guide/workspace.html)
- [@vitest/browser-playwright](https://www.npmjs.com/package/@vitest/browser-playwright)
