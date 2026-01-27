# Tasks: refactor-component-hierarchy

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Verify no pending changes in current components
- [ ] Backup current keys/layout knowledge if needed

## Implementation Steps

### Step 0: Create Atoms

Define the smallest building blocks.

**Files to modify:**
- `src/components/atoms/Container.svelte`
- `src/components/atoms/Button.svelte`
- `src/components/atoms/Title.svelte`
- `src/components/atoms/Text.svelte`

**Changes:**
- Create generic wrapper components
- Extract styles from existing specific components (e.g., `CsvUploadButton` styles to `Button`)

### Step 1: Create Molecules

Create groups of atoms functioning together.

**Files to modify:**
- `src/components/molecules/UploadCsv.svelte` (was `CsvUploadButton`)
- `src/components/molecules/ClearCsv.svelte` (extract from `AppHeader` or `SummaryCards`)
- `src/components/molecules/NavigationItem.svelte`
- `src/components/molecules/DashboardContainer.svelte`
- `src/components/molecules/DashboardPanel.svelte` (Generic panel wrapper)
- `src/components/molecules/Header.svelte` (Visual bar structure)
- `src/components/molecules/NavigationBar.svelte`

**Changes:**
- Move `CsvUploadButton` to `UploadCsv` and use `Button` atom
- Extract clear function to `ClearCsv` molecule
- Create `DashboardPanel` to wrap charts/tables (replacing specific container styles in Organsims)
- Assemble `Header` molecule from visual parts of `AppHeader`

### Step 2: Create Organisms

Create complex sections formed from molecules.

**Files to modify:**
- `src/components/organisms/PageTitle.svelte`
- `src/components/organisms/Dashboard.svelte`
- `src/components/organisms/QuickSummary.svelte` (refactor from `SummaryCards`)
- `src/components/organisms/FilterPanel.svelte` (update to use new Atoms/Molecules)
- `src/components/organisms/OverviewTab.svelte`
- `src/components/organisms/PreviewTab.svelte`

**Changes:**
- Break down `AppHeader` into `Header` (Molecule) and `PageTitle` (Organism) logic
- Move `SummaryCards` to `QuickSummary`
- Create `OverviewTab` to hold Row 1, Row 2, Row 3 logic from `+page.svelte`
- Create `PreviewTab` to hold `DataPreviewPanel` logic from `+page.svelte`
- Create `Dashboard` organism to act as the main orchestrator (if distinct from PageTitle) or refactor `+page.svelte` to use these Organisms directly

### Step 3: Update Integration

Update the main page to use the new Organisms.

**Files to modify:**
- `src/routes/+page.svelte`

**Changes:**
- Replace direct markup with `Dashboard`, `PageTitle` (if used here), `OverviewTab`, etc.
- Remove old imports

## Verification

- [ ] Check all component imports are resolved
- [ ] Verify `npm run check` passes
- [ ] Verify Application loads and Tabs switch correctly
- [ ] Check "Clear" and "Upload" buttons function as before

