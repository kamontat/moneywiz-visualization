# Tasks: refactor-src-lib-structure

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Ensure git working tree is clean.
- [ ] Run full test suite to confirm baseline passes.

## Implementation Steps

### Step 1: Modularize Analytics

Break down `src/lib/analytics.ts` into a directory structure.

**Files to modify:**
- `src/lib/analytics.ts` (delete/convert to barrel)
- `src/lib/analytics/index.ts` (new)
- `src/lib/analytics/totals.ts` (new)
- `src/lib/analytics/categories.ts` (new)
- `src/lib/analytics/filters.ts` (new)
- `src/lib/analytics/timeseries.ts` (new)
- `src/lib/analytics/tags.ts` (new)

**Changes:**
- Create `src/lib/analytics/` directory.
- Move `calculateTotals` to `totals.ts`.
- Move `calculateTopCategories`, `calculateCategoryBreakdown` to `categories.ts`.
- Move `getTHBRows`, `filterByDateRange`, `filterByTags`, `getDateRange` to `filters.ts`.
- Move `calculateDailyExpenses`, `calculateIncomeExpenseTimeSeries` to `timeseries.ts`.
- Move `parseTagsFromField`, `parseAllTags` to `tags.ts`.
- Export all functions from `src/lib/analytics/index.ts` to maintain backward compatibility where possible, or update consumers to import specific submodule if desired (Barrel export preferred for now to minimize churn).

### Step 2: Modularize CSV Handling

Break down `src/lib/csv.ts` into a directory structure.

**Files to modify:**
- `src/lib/csv.ts` (delete/convert to barrel)
- `src/lib/csv/index.ts` (new)
- `src/lib/csv/parser.ts` (new)
- `src/lib/csv/transformer.ts` (new)
- `src/lib/csv/types.ts` (new - or keep in common types if circular dep arises)

**Changes:**
- Create `src/lib/csv/` directory.
- Move `parseCsvFile`, `parseCsv`, `tokenize` to `parser.ts`.
- Move `transformRow`, `parseMoneyWizReport`, and field parsers (`parseCategory`, `parseAmount`, etc.) to `transformer.ts`.
- Move CSV specific types/errors (like `CsvParseError`, `ParsedCsv`) to the module where they are defined or a shared `types.ts` inside the `csv` folder.
- Create barrel file `src/lib/csv/index.ts`.

### Step 3: Update Imports

Update all references in the application to point to the new locations.

**Files to modify:**
- `src/**/*.svelte`
- `src/**/*.ts`
- Tests (`src/lib/*.spec.ts` need to be moved or updated)

**Changes:**
- Update import paths.
- Move `src/lib/analytics.spec.ts` to `src/lib/analytics/analytics.spec.ts` (or split it).
- Move `src/lib/csv.spec.ts` to `src/lib/csv/csv.spec.ts` (or split it).

## Verification

- [ ] Run `bun run check` to ensure no broken imports.
- [ ] Run `bun run test:unit` to verify everything still works.
- [ ] Run `bun run build` to ensure production build is valid.
