# Tasks: integrate-e2e-into-vitest

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Verify `@vitest/browser-playwright` is installed
- [ ] Verify all E2E tests pass with current Playwright configuration
- [ ] Check if E2E tests use Playwright Test API or need conversion

## Implementation Steps

### Step 0: Add E2E project to Vitest configuration

Add a third project to `vite.config.ts` for E2E tests that uses Playwright in browser mode.

**Files to modify:**
- vite.config.ts

**Changes:**
- Add new project with `name: 'e2e'`
- Configure browser mode with Playwright provider
- Set `include: ['e2e/**/*.{test,spec}.{js,ts}']`
- Configure to run against built app (preview server)
- Remove `e2e/**` from top-level exclude list
- Set appropriate test environment and browser options

### Step 1: Update package.json scripts

Replace Playwright test commands with Vitest commands for E2E tests.

**Files to modify:**
- package.json

**Changes:**
- Update `test:e2e` script from `playwright test` to `vitest run --project=e2e`
- Update `test` script to run all Vitest projects
- Add `test:client` script: `vitest run --project=client`
- Add `test:server` script: `vitest run --project=server`
- Ensure all scripts use `bun` (not npm/npx)

### Step 2: Remove Playwright standalone configuration

Delete the separate Playwright configuration file since E2E tests will run through Vitest.

**Files to modify:**
- playwright.config.ts (delete)

**Changes:**
- Remove `playwright.config.ts` file
- Verify no other files reference this configuration

### Step 3: Update dependencies

Remove `@playwright/test` package since Vitest will handle test execution.

**Files to modify:**
- package.json

**Changes:**
- Remove `@playwright/test` from devDependencies
- Keep `playwright` (required by @vitest/browser-playwright)
- Keep `@vitest/browser-playwright`
- Run `bun install` to update lockfile

### Step 4: Test E2E integration

Verify all E2E tests run correctly through Vitest.

**Files to modify:**
- None (testing only)

**Changes:**
- Run `bun run test:e2e` to execute E2E tests via Vitest
- Verify all 10 E2E test files pass
- Run `bun run test` to ensure all test projects work together
- Check that tests can still run individually by name

### Step 5: Update documentation

Update README.md to reflect the unified test approach.

**Files to modify:**
- README.md

**Changes:**
- Update test commands section
- Explain Vitest projects (server, client, e2e)
- Document how to run specific test projects
- Remove references to standalone Playwright
- Update any troubleshooting sections

## Verification

- [ ] `bun run test:e2e` successfully runs E2E tests through Vitest
- [ ] `bun run test:unit` runs unit and component tests
- [ ] `bun run test` runs all test projects
- [ ] `bun vitest run --project=e2e` works as expected
- [ ] `bun vitest run --project=client` runs only component tests
- [ ] `bun vitest run --project=server` runs only server tests
- [ ] `playwright.config.ts` no longer exists
- [ ] `@playwright/test` is removed from package.json
- [ ] All existing tests still pass
