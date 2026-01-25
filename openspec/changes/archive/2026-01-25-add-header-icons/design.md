# Design: Header Icons

## Architectural Context
The icons will be implemented using **Iconify SVG + CSS** Svelte components. This method provides the best balance of performance (modern browser optimizations) and developer experience (named component imports).

## Decision Log

### 1. SVG + CSS vs SVG in CSS
**Decision**: Use **SVG + CSS** components (`@iconify-svelte/*`).
**Rationale**: Recommended by Iconify for Svelte applications. It uses advanced CSS features to render SVGs efficiently while providing fallback support for older browsers (like those without `path()` support in `d` property). It's more type-safe and easier to use in Svelte than managing CSS classes.

### 2. Implementation details
- **Package**: `@iconify-svelte/lucide`
- **Imports**: Direct imports from package subpaths (e.g., `@iconify-svelte/lucide/upload`) to ensure optimal bundling.
- **Sizing**: SVG + CSS components do not set default sizes. We will use Tailwind `w-5 h-5` (20px) or `w-[1.125rem] h-[1.125rem]` (18px) to match the project's design.

### 3. Icon Selection
- **Upload**: `lucide:upload` → `import UploadIcon from "@iconify-svelte/lucide/upload"`
- **Clear**: `lucide:trash-2` → `import TrashIcon from "@iconify-svelte/lucide/trash-2"`

### 4. Styling
- **Size**: Managed via Tailwind classes on the icon component.
- **Color**: Monotone icons use `currentColor`, so they automatically match text color changes (e.g., hover states).

## UI Components
- `src/components/CsvUploadButton.svelte`
- `src/components/AppHeader.svelte`
