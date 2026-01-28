# Tasks: improve-test-structure

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Identify all `src/routes/*.spec.ts` files.
- [ ] Verify `e2e/` directory exists and is configured.

## Implementation Steps

### Step 0: Utilities Setup
Create helper functions for E2E tests to generate CSV data programmatically.

**Files to modify:**
- `e2e/utils/csv-generator.ts` (new file)

**Changes:**
- Implement function to generate valid MoneyWiz CSV string/file with customizable data.

### Step 1: Move and Refactor Page Tests
Move `src/routes/page.svelte.spec.ts` to `e2e/` and refactor it to use Playwright and dynamic data.

**Files to modify:**
- `src/routes/page.svelte.spec.ts` (delete)
- `e2e/home-page.spec.ts` (create)

**Changes:**
- Re-implement tests to visit the home page.
- Generate valid CSV data using the utility.
- Upload the generated CSV via the UI.
- Assert expected state (dashboard visibility, etc.).

### Step 2: Move and Refactor Layout Tests
Move `src/routes/layout.svelte.spec.ts` to `e2e/` (if applicable) or component tests, but per instructions, move to `e2e/`.

**Files to modify:**
- `src/routes/layout.svelte.spec.ts` (delete)
- `e2e/layout.spec.ts` (create or merge into others)

**Changes:**
- Refactor as global layout tests (navigation, header, footer checks) in Playwright.

### Step 3: Update Existing E2E Tests
Refactor existing `e2e/*.spec.ts` files to use the new CSV generator instead of static files.

**Files to modify:**
- `e2e/category-breakdown.spec.ts`
- `e2e/currency-format.spec.ts`
- `e2e/dashboard.spec.ts`
- `e2e/filtering.spec.ts`
- `e2e/preview-table.spec.ts`
- `e2e/upload.spec.ts`
- (and others in `e2e/`)

**Changes:**
- Replace `path: 'static/data/report.csv'` with dynamic file creation/buffer upload.
- Ensure each test has its own isolated dataset.

## Verification

- [ ] Run `bun run test:e2e` and ensure all tests pass.
- [ ] Verify no `*.spec.ts` files exist in `src/routes/`.
- [ ] Search codebase for `static/data/report.csv` in `e2e/` folder to ensure 0 results.
