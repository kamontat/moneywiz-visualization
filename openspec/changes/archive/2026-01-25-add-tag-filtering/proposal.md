# Change: Add Tag-Based Filtering

## Why
Users need to filter transactions by tags to analyze spending patterns within specific tag categories (e.g., "Group: KcNt", "Type: Personal"). MoneyWiz CSV exports include a Tags column with structured data (`<category>: <name>`), but the application currently only supports date-based filtering. This limits users' ability to drill down into specific segments of their financial data.

## What Changes
- Parse tags from the CSV "Tags" column, supporting multiple tag entries per row separated by semicolons (e.g., "Group: KcNt; Type: Personal; ")
- Extract unique tag categories and their values dynamically from loaded CSV data
- Add tag filter controls to the existing collapsible FilterPanel UI
- Group tag selections by category with multi-select capability
- Support two filtering modes per category: **Include** (show only matching tags) and **Exclude** (hide matching tags)
- Persist tag filter selections in localStorage alongside CSV data
- Apply tag filters in combination with existing date filters
- Update analytics logic to filter rows based on tag criteria before visualization

## Impact
- **Affected specs**: `filtering` (3 new requirements added)
- **Affected code**:
  - `src/lib/analytics.ts` - Add `parseAllTags()` and `filterByTags()` functions
  - `src/components/organisms/FilterPanel.svelte` - Add tag filter UI controls
  - `src/lib/stores/csv.ts` - Extend store to persist tag filter state
  - `src/routes/+page.svelte` - Wire tag filtering into derived data flow
- **Testing**: Unit tests for tag parsing/filtering logic + E2E tests for UI interactions
