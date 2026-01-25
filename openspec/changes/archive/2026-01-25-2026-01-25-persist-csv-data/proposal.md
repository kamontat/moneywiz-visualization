# Proposal: Persist CSV Data in Local Storage

## Problem Statement

Currently, when a user uploads a CSV file, the data is only stored in memory (Svelte store). If the user refreshes the page, the data is lost, and they have to upload the file again. This is inconvenient for users who want to analyze their data over multiple sessions without re-uploading.

## Proposed Solution

Implement client-side persistence for the uploaded CSV data and metadata (filename) using `localStorage`.

- **Persistence**: Store the parsed CSV data and filename in `localStorage` when it's successfully uploaded or parsed.
- **Hydration**: On application initialization (in the CSV store or layout), check for existing data in `localStorage` and hydrate the store.
- **Cleanup**: Clear the data from `localStorage` only when the user explicitly clicks the "Clear" button.
- **Performance**: Large CSV files could exceed `localStorage` limits (~5MB). We should implement basic error handling or consider `IndexedDB` if `localStorage` fails, though `localStorage` is sufficient for typical MoneyWiz exports.

## Impact

- **User Experience**: Improved convenience as data survives page refreshes.
- **Logic**: Modifications to `src/lib/stores/csv.ts` for persistence logic.
- **Layout**: Updates to `src/routes/+layout.svelte` to ensure visual state matches hydrated store.
- **Testing**: New E2E tests to verify persistence across refreshes.

## Alternatives Considered

- **IndexedDB**: Better for large datasets, but more complex API. Given MoneyWiz exports are typically within `localStorage` limits, `localStorage` is a simpler starting point.
- **SessionStorage**: Not suitable as it doesn't survive tab closure/reopening (though the user specifically mentioned "refresh", persistence across sessions is usually preferred for financial analysis).

## Verification Plan

### Automated Tests
- **Store Unit Test**: Verify that calling `csvStore.set()` updates `localStorage` and `csvStore.reset()` clears it.
- **E2E Test**:
  1. Upload a CSV.
  2. Verify data is displayed.
  3. Refresh the page.
  4. Verify data is still displayed without re-uploading.
  5. Click "Clear".
  6. Refresh the page.
  7. Verify data is gone.

### Manual Verification
- Upload large-ish CSV and check for console errors related to quota.
- Inspect Application tab in DevTools to verify structure of stored data.
