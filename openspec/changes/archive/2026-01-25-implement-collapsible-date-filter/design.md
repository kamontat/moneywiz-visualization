# Design: Collapsible Date Filter

## Architecture Overview

The filtering logic will follow a unidirectional data flow using Svelte 5 runes. The raw data remains in the `csvStore`, while the dashboard view manages its own filtering state.

### Data Flow
1.  `csvStore` (Raw Data) -> `+page.svelte` (Dashboard)
2.  `+page.svelte` defines `$state` for `filterStart` and `filterEnd`.
3.  `+page.svelte` derives `filteredRows`:
    ```typescript
    const thbRows = $derived(getTHBRows(csv.data));
    const filteredRows = $derived(filterByDateRange(thbRows, filterStart, filterEnd));
    ```
4.  All other metrics (`totals`, `topCategories`, etc.) derive from `filteredRows`.
5.  `FilterPanel.svelte` receives `filterStart` and `filterEnd` (via props or bindings) and triggers updates.

## Component Design: `FilterPanel.svelte`

### Properties
- `start: Date | null` (bindable)
- `end: Date | null` (bindable)
- `minDate: Date` (earliest transaction)
- `maxDate: Date` (latest transaction)

### Internal State
- `isOpen: boolean = false` - controls the collapsible visibility.

### Quick Actions
- **This Month**: From the 1st day of the current month to today.
- **Last 30 Days**: From 30 days ago to today.
- **This Year**: From Jan 1st of the current year to Dec 31st (or today).
- **All Time**: Resets start and end to `null` or `minDate`/`maxDate`.

## Analytics Logic: `filterByDateRange`

```typescript
export function filterByDateRange(
    rows: Record<string, string>[],
    start: Date | null,
    end: Date | null
): Record<string, string>[] {
    if (!start && !end) return rows;

    return rows.filter(row => {
        const date = parseDateDDMMYYYY(row['Date']);
        if (!date) return false;

        if (start && date < start) return false;
        if (end && date > end) return false;

        return true;
    });
}
```

## UI/UX Considerations
- **Placement**: The filter panel will be positioned immediately below the dashboard header and above the summary cards.
- **Visuals**:
    - Use a subtle background (e.g., `bg-mw-surface`) with a border to distinguish it from the background `bg-mw-bg`.
    - The entry/exit should use a smooth slide/fly transition to feel "weightless" and organic.
    - When collapsed, a "Filter" button (possibly with an icon) should be visible in the header area or just below it.
- **Responsiveness**:
    - Quick buttons should wrap gracefully on mobile.
    - Date inputs should stack on very small screens but be side-by-side on tablet+.
