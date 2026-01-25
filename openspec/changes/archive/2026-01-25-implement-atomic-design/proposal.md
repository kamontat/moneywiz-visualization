# Proposal: Implement Atomic Design Methodology

## Problem
The current component structure in `src/components/` is flat. As the project grows, it will become harder to navigate and maintain. There is no clear hierarchy for UI components, making it difficult to distinguish between foundational building blocks and complex sections.

## Proposed Change
Reorganize the `src/components/` directory using the **Atomic Design** methodology (Atoms, Molecules, Organisms). This will provide a clear hierarchical structure and improve maintainability.

### Key Changes
1. Create subdirectories: `atoms/`, `molecules/`, and `organisms/` within `src/components/`.
2. Move existing components into their respective categories:
   - **Atoms**: Foundational elements (e.g., `MoneyLogo.svelte`)
   - **Molecules**: Simple combinations of atoms (e.g., `CsvUploadButton.svelte`)
   - **Organisms**: Complex UI sections (e.g., `AppHeader.svelte`, `SummaryCards.svelte`, and all Charts)
3. Update all import paths across the codebase and tests to reflect the new structure.
4. Ensure path aliases still work or update them if necessary (the `$components` alias usually points to `src/components/`, so imports would become `$components/atoms/...`).

## Impact
- **Maintainability**: Clearer structure for where new components should live.
- **Scalability**: Easier to manage a large number of components.
- **Imports**: All files importing components will need updates.
- **Tests**: Component test locations and imports will need updates to follow the new structure.
