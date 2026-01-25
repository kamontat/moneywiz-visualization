# Design: Dashboard and Header Refinement

## Architectural Decisions

### 1. Conditional Dashboard Title
The `h1` title in the main dashboard view will be moved inside the data-loaded check block.
- **File**: `src/routes/+page.svelte`
- **Implementation**: Move `<h1>` into `{#if csv.data}`.

### 2. GitHub Header Link
A link to the GitHub repository will be added to the header.
- **File**: `src/components/organisms/AppHeader.svelte`
- **Library**: `@iconify-svelte/lucide/github`
- **Link**: `https://github.com/kamontat/moneywiz-visualization`
- **Styling**: 
  - Use a simple anchor tag with the GitHub icon.
  - Apply hover effects consistent with the title link.
  - Position: At the far right of the header buttons group.

### 3. Layout Inversion and Collapsable Preview
The order of content in the layout will be changed.
- **File**: `src/routes/+layout.svelte`
- **Implementation**:
  - Move `{@render children()}` to appear before the `{#if parsedUpload}` block.
  - Implement a `isCollapsed` state (using Svelte 5 `$state`) for the Preview section.
  - Add a toggle button (using a Chevron icon) to expand/collapse the preview table.
  - The preview section will be collapsed by default to prioritize charts.

## Component Changes

### AppHeader.svelte
- Import `GithubIcon` from `@iconify-svelte/lucide/github`.
- Add `<a href="..." target="_blank">` after the `CsvUploadButton`.

### +page.svelte (page.svelte)
- Relocate `<h1>Dashboard</h1>` inside the `{#if csv.data}` block.

### +layout.svelte
- Reorder `children()` and `parsedUpload` section.
- Add `$state` for collapse logic.
- Add toggle UI for the preview table.

## Testing Strategy
- **Unit**: 
  - Update `page.svelte.spec.ts` to expect "Dashboard" only when data is present.
  - Update `AppHeader.svelte.spec.ts` to verify the presence of the GitHub link.
- **E2E**: 
  - Verify "Dashboard" is NOT visible on initial load.
  - Verify GitHub icon is visible in the header.
