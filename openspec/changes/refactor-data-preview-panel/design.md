# Design: Data Preview Panel

## Component: `DataPreviewPanel` (Organism)

### Structure
- **Container**: `div.border.rounded-xl.overflow-hidden.bg-mw-surface`
- **Header**:
    - `<button>` (full width)
    - Flex layout: Title on left, Chevron on right.
    - Title: "Data Preview"
    - Styling: `bg-gray-50/50 hover:bg-gray-50` (neutral theme)
- **Content**:
    - Responsive table container `div.overflow-x-auto`
    - Check for data existence (`rows.length > 0`)
    - Empty state styling if no rows.

### Logic
- **Props**:
    - `data: ParsedCsv | null`
    - `isCollapsed` (optional, default true) - *Design change: Let component manage its own collapsed state internally to match CategoryBreakdown*
- **State**:
    - `isOpen`: boolean (default `false` to match current "collapsed by default" or `!isCollapsed`)
- **Interaction**:
    - Click header -> Toggle `isOpen`.

### Formatting
- Keep existing table styles (compact, text-sm).
- Limit to `maxPreviewRows` (5) as before.

## Integration
- Remove inline code from `src/routes/+layout.svelte`.
- Import `DataPreviewPanel` in `src/routes/+layout.svelte`.
- Pass `parsedUpload` data to the new component.
