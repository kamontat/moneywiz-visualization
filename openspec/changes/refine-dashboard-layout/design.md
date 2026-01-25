# Design: Refine Dashboard Layout

## Architectural Changes
The primary changes are focused on the presentation layer (`src/routes/+page.svelte`, `src/routes/+layout.svelte`, and `src/components/organisms/SummaryCards.svelte`).

### 1. Dashboard Page Hook Up (`src/routes/+page.svelte`)
-   Implement a new header section specifically for the dashboard that includes:
    -   A date range component on the left.
    -   The "Dashboard" title centered.
-   Introduce a `$state` variable for the active tab (defaulting to 'overview').
-   Render the "Overview" tab content which will house the `SummaryCards` and the charts.

### 2. Tab System
-   A simple tab bar below the dashboard title.
-   Visual feedback for the active tab (Underline or background highlight).

### 3. Upload Status Hierarchy (`src/routes/+layout.svelte`)
-   Reorder elements in the `parsedUpload` section header.
-   Adjust font sizes: File name should be smaller, status label should be on top.

### 4. Summary Cards Styling (`src/components/organisms/SummaryCards.svelte`)
-   Refine the spacing and typography to match the "quick summary" aesthetic requested.

## Components
-   **DashboardHeader (New Atom or Molecule?)**: To handle the centered title and date range. Actually, I might keep it in `+page.svelte` for now or create a molecule if it gets complex. Given the guidelines, I'll keep the route minimal.

## Testing Strategy
-   **Unit Tests**: Update tests for `SummaryCards` and `analytics` (if date range logic is added).
-   **E2E Tests**: Add tests to verify the presence of the date range and the centered title. Verify tab switching (even if only one tab exists now).
