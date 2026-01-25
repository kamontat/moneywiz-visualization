# Design: CSV Data Persistence

## Architecture

The persistence logic will be encapsulated within the `csvStore` in `src/lib/stores/csv.ts`. This ensures that any component using the store automatically benefits from persistence without extra logic.

### Data Structure in LocalStorage

We will use a single key `mw_csv_data` to store a JSON string containing the `CsvState`.

```typescript
// MW_CSV_STORAGE_KEY = 'moneywiz_csv_data'
{
  "fileName": "report.csv",
  "data": {
    "headers": ["Date", "Description", "Amount", ...],
    "rows": [
      { "Date": "2024-01-01", "Description": "Test", "Amount": "10.00", ... },
      ...
    ]
  }
}
```

### Implementation Details

#### 1. Store Hydration
The store will initialize by reading from `localStorage`. Since this is a client-only app with static adapter, we need to be careful about SSR/prerendering, although `csvStore` is currently initialized at the module level.

```typescript
// Inside createCsvStore
const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
const initialState: CsvState = stored ? JSON.parse(stored) : { fileName: null, data: null };
```

#### 2. Automatic Syncing
The `set` and `update` methods will be wrapped to save to `localStorage` whenever the state changes.

```typescript
set: (value: CsvState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }
  set(value);
}
```

#### 3. Layout Hydration
The `src/routes/+layout.svelte` currently uses a local `$state` `parsedUpload` which is synced from the store on upload, but NOT on initial load if the store is already hydrated. We need to update the layout to synchronize its local state with the store on mount.

### Quota Handling
If `localStorage.setItem` throws a `QUOTA_EXCEEDED_ERR`, we should:
1. Log the error.
2. Consider notifying the user via a toast/alert that data couldn't be saved for future sessions (optional for first iteration).
3. The in-memory store will still work for the current session.

## UI/UX Changes
No visible UI changes are expected, except that data will persist after refresh. The "Clear" button will now also clear `localStorage`.
