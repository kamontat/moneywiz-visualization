## 1. Analytics Logic - Tag Parsing
- [x] 1.1 Create `parseTagsFromField(tagsField: string): Record<string, string>` function in `src/lib/analytics.ts` to parse individual tag field
- [x] 1.2 Create `parseAllTags(rows: CsvRow[]): Map<string, Set<string>>` function to extract all unique categories and values from dataset
- [x] 1.3 Write unit tests for tag parsing in `src/lib/analytics.spec.ts` covering:
  - Single tag entry
  - Multiple tag entries per field
  - Empty/missing tags
  - Unique category/value extraction
  - Edge cases (trailing semicolons, extra whitespace, malformed entries)

## 2. Analytics Logic - Tag Filtering
- [x] 2.1 Create `TagFilter` type/interface: `{ category: string, values: string[], mode: 'include' | 'exclude' }`
- [x] 2.2 Create `filterByTags(rows: CsvRow[], filters: TagFilter[]): CsvRow[]` function in `src/lib/analytics.ts`
- [x] 2.3 Write unit tests for tag filtering in `src/lib/analytics.spec.ts` covering:
  - Include mode (single tag, multiple tags within category)
  - Exclude mode (single tag, multiple tags within category)
  - Multi-category filtering (combine with AND logic)
  - No filters applied (returns all rows)
  - Combination with `filterByDateRange` (sequential filtering)

## 3. Store Enhancement - Tag Filter Persistence
- [x] 3.1 Extend CSV store in `src/lib/stores/csv.ts` to include tag filter state
- [x] 3.2 Add `setTagFilters(filters: TagFilter[]): void` action to store
- [x] 3.3 Add `clearTagFilters(): void` action to store
- [x] 3.4 Implement localStorage persistence for tag filters (saved alongside CSV data)
- [x] 3.5 Write unit tests for store tag filter state management in `src/lib/stores/csv.spec.ts`

## 4. FilterPanel UI - Tag Filter Controls
- [x] 4.1 Extract tag categories and values using `parseAllTags()` in `FilterPanel.svelte` from current CSV data
- [x] 4.2 Add UI section for tag filters within the collapsible panel (below date filters, above quick presets)
- [x] 4.3 For each category, create:
  - Category label display
  - Include/Exclude mode toggle (radio buttons or switch)
  - Multi-select dropdown for tag values
- [x] 4.4 Bind tag selections to local component state using `$state` runes
- [x] 4.5 Add "Clear Tag Filters" button (visible when tag filters are active)
- [x] 4.6 Update "Active" badge logic to reflect both date and tag filters
- [x] 4.7 Write component tests for `FilterPanel.svelte` in `FilterPanel.svelte.spec.ts` verifying:
  - Tag categories render correctly
  - Mode toggle updates state
  - Multi-select updates selections
  - Clear button resets tag filters

## 5. Integration - Wire Tag Filtering into Data Flow
- [x] 5.1 In `src/routes/+page.svelte`, read tag filter state from store
- [x] 5.2 Create derived state: `const tagFilteredRows = $derived(filterByTags(filteredRows, tagFilters))`
- [x] 5.3 Update all dashboard components to consume `tagFilteredRows` instead of `filteredRows`
- [x] 5.4 Ensure filter order: Date filter → Tag filter → Analytics calculations
- [x] 5.5 Update row count display to reflect tag filtering

## 6. E2E Testing
- [x] 6.1 Create `e2e/tag-filtering.spec.ts` with tests for:
  - Tag filter UI appears when CSV is loaded
  - Tag categories populate from CSV data
  - Selecting tags in include mode filters transactions correctly
  - Selecting tags in exclude mode hides transactions correctly
  - Multi-category filtering works (combine with AND logic)
  - Tag filters persist across page reload
  - Clear tag filters button restores unfiltered view
  - Tag filters combine with date filters correctly
- [x] 6.2 Update existing `e2e/filtering.spec.ts` if needed to ensure date+tag filter compatibility

## 7. Documentation & Validation
- [x] 7.1 Update AGENTS.md if new patterns or conventions are introduced
- [x] 7.2 Run `bun run test` to ensure all unit and component tests pass
- [x] 7.3 Run `bun run test:e2e` to ensure E2E tests pass
- [x] 7.4 Run `openspec validate add-tag-filtering --strict --no-interactive` and resolve any issues
