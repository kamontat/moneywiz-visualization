# Spec: tech-component-architecture

## Purpose

Defines the strict Atomic Design component hierarchy and architectural rules for the MoneyWiz Visualization project to ensure consistency, reusability, and maintainability across the UI codebase.

## Requirements

### Requirement: Atomic Design Hierarchy

The application SHALL organize all UI components into three strict categories following Atomic Design principles.

#### Scenario: Atoms - Generic Base Components

- **Given** a component is foundational and generic
- **Then** it MUST be placed in `src/components/atoms/`
- **And** atoms MUST NOT import other atoms, molecules, or organisms
- **And** atoms MUST accept props and snippets for customization
- **And** atoms MUST include: Button, Title, Text, Container
- **And** atoms MAY include: MoneyLogo

**Examples of Atoms:**
- `Button`: Generic button with variants (primary, danger, ghost, tab, icon)
- `Title`: Heading component with configurable levels (h1-h6)
- `Text`: Text component with variants (body, small, caption)
- `Container`: Generic wrapper with padding/spacing options

#### Scenario: Molecules - Composition Components

- **Given** a component combines atoms or other molecules for a specific purpose
- **Then** it MUST be placed in `src/components/molecules/`
- **And** molecules MAY import atoms
- **And** molecules MAY import other molecules (with caution to avoid circular dependencies)
- **And** molecules MUST NOT import organisms
- **And** molecules MUST include: UploadCsv, ClearCsv, Header, NavigationBar, NavigationItem, DashboardPanel, DashboardContainer

**Examples of Molecules:**
- `UploadCsv`: File upload button using Button atom
- `ClearCsv`: Clear data button using Button atom
- `Header`: Application header wrapper with glassmorphism
- `NavigationBar`: Tab navigation component
- `NavigationItem`: Individual tab item
- `DashboardPanel`: Reusable panel wrapper for charts/content

#### Scenario: Organisms - Complex Section Components

- **Given** a component represents a major section or feature with significant logic
- **Then** it MUST be placed in `src/components/organisms/`
- **And** organisms MAY import atoms and molecules
- **And** organisms MAY import other organisms (for composition)
- **And** organisms MUST handle business logic, data processing, or complex interactions
- **And** organisms MUST include: Dashboard, AppHeader, PageTitle, QuickSummary, OverviewTab, PreviewTab, FilterPanel, CategoryBreakdown, TopCategoriesChart

**Examples of Organisms:**
- `Dashboard`: Main dashboard orchestrator
- `AppHeader`: Application header with actions and branding
- `PageTitle`: Page title with filename display
- `QuickSummary`: Financial summary cards (Income, Expenses, Net, Saving Rate)
- `OverviewTab`: Overview tab content with charts
- `PreviewTab`: Data preview tab with table
- `FilterPanel`: Filtering UI with date range and tag filters

### Requirement: Component File Structure

The application SHALL co-locate component tests with their source files.

#### Scenario: Test file placement

- **Given** a component file exists at `src/components/{category}/{ComponentName}.svelte`
- **Then** its test file MUST be at `src/components/{category}/{ComponentName}.svelte.spec.ts`
- **And** test files MUST be in the same directory as the component
- **And** test files MUST NOT be in a separate `__tests__` directory

### Requirement: Import Rules

The application SHALL enforce strict import dependency rules to prevent circular dependencies and maintain clear hierarchy.

#### Scenario: Allowed imports by component type

- **Given** a component is being developed
- **Then** atoms MUST NOT import any other component category
- **And** molecules MAY import atoms and molecules
- **And** organisms MAY import atoms, molecules, and organisms
- **And** routes (pages/layouts) MAY import any component type but MUST prefer organisms for major sections

#### Scenario: Prevent circular dependencies

- **Given** a component imports another component
- **Then** the imported component MUST NOT directly or indirectly import the original component
- **And** circular imports MUST be detected and prevented during development
- **And** the build MUST fail if circular dependencies are detected

### Requirement: Component Naming Conventions

The application SHALL follow consistent naming patterns for component files.

#### Scenario: File naming

- **Given** a new component is created
- **Then** component files MUST use PascalCase (e.g., `Button.svelte`, `UploadCsv.svelte`)
- **And** test files MUST append `.spec.ts` to the component name (e.g., `Button.svelte.spec.ts`)
- **And** component names SHOULD be descriptive and purpose-driven

### Requirement: Props and Snippet Usage

The application SHALL use Svelte 5 Runes syntax for component props and snippets.

#### Scenario: Props declaration

- **Given** a component accepts props
- **Then** props MUST be declared using `$props()` rune
- **And** props MUST include TypeScript types (inline or via interface)
- **And** optional props MUST have default values or be marked optional with `?`

#### Scenario: Snippet (children) usage

- **Given** a component accepts children content
- **Then** it MUST declare a `children` prop with type `Snippet`
- **And** optional children MUST be marked with `?` (e.g., `children?: Snippet`)
- **And** rendering MUST use `{@render children?.()}` for optional children
- **And** rendering MUST use `{@render children()}` for required children

## Constraints

- All components must follow Svelte 5 Runes syntax ($props, $derived, $effect, $state)
- Import hierarchy must be strictly enforced (atoms → molecules → organisms → routes)
- No circular dependencies allowed
- All components must have co-located test files
- Test files must use Vitest and vitest-browser-svelte
- Component naming must be PascalCase

## Examples

### Example: Button Atom

```svelte
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        type?: 'button' | 'submit' | 'reset';
        variant?: 'primary' | 'danger' | 'ghost';
        disabled?: boolean;
        onclick?: (e: MouseEvent) => void;
        children?: Snippet;
    }

    let {
        type = 'button',
        variant = 'primary',
        disabled = false,
        onclick,
        children
    }: Props = $props();
</script>

<button {type} {disabled} {onclick}>
    {@render children?.()}
</button>
```

### Example: UploadCsv Molecule

```svelte
<script lang="ts">
    import Button from '$components/atoms/Button.svelte';
    import UploadIcon from '@iconify-svelte/lucide/upload';

    interface Props {
        onparsed?: (detail: { file: File; data: any }) => void;
    }

    let { onparsed }: Props = $props();

    // ... upload logic
</script>

<Button variant="primary" onclick={openPicker}>
    <UploadIcon />
    <span>Upload CSV</span>
</Button>
```

### Example: Dashboard Organism

```svelte
<script lang="ts">
    import QuickSummary from './QuickSummary.svelte';
    import NavigationBar from '$components/molecules/NavigationBar.svelte';
    import OverviewTab from './OverviewTab.svelte';
    import PreviewTab from './PreviewTab.svelte';

    // Complex orchestration logic
    let activeTab = $state('overview');
</script>

<div>
    <QuickSummary {totals} />
    <NavigationBar bind:activeTab />
    {#if activeTab === 'overview'}
        <OverviewTab {...data} />
    {:else}
        <PreviewTab {...data} />
    {/if}
</div>
```

## Notes

This architecture ensures:
- **Reusability**: Atoms and molecules can be used throughout the app
- **Maintainability**: Clear boundaries prevent spaghetti code
- **Testability**: Co-located tests encourage test coverage
- **Scalability**: Well-defined hierarchy supports growth

When in doubt about component placement:
1. If it's generic and self-contained → Atom
2. If it combines atoms for a specific purpose → Molecule
3. If it handles complex logic or orchestrates multiple components → Organism
