# Design: Atomic Design Classification

This document outlines the classification of existing components according to the Atomic Design methodology.

## Component Classification

### Atoms
Atoms are the basic building blocks that cannot be broken down further without losing their functionality.
- `MoneyLogo.svelte`: A standalone SVG logo.

### Molecules
Molecules are groups of atoms bonded together that take on distinct new properties.
- `CsvUploadButton.svelte`: Combines a button atom (standard HTML `<button>` or a UI library button) with an icon and text to perform a specific action (upload).

### Organisms
Organisms are complex UI components composed of groups of molecules and/or atoms. They form distinct sections of an interface.
- `AppHeader.svelte`: Combines the logo (atom), navigation/actions (molecules/atoms), and layout.
- `SummaryCards.svelte`: A complex section that groups multiple data points and visual representations.
- `DailyExpensesChart.svelte`: A complex data visualization section.
- `IncomeExpenseRatioChart.svelte`: A complex data visualization section.
- `TopCategoriesChart.svelte`: A complex data visualization section.

## File Structure
```
src/components/
  atoms/
    MoneyLogo.svelte
    MoneyLogo.svelte.spec.ts
  molecules/
    CsvUploadButton.svelte
    CsvUploadButton.svelte.spec.ts
  organisms/
    AppHeader.svelte
    AppHeader.svelte.spec.ts
    SummaryCards.svelte
    SummaryCards.svelte.spec.ts
    DailyExpensesChart.svelte
    DailyExpensesChart.svelte.spec.ts
    IncomeExpenseRatioChart.svelte
    IncomeExpenseRatioChart.svelte.spec.ts
    TopCategoriesChart.svelte
    TopCategoriesChart.svelte.spec.ts
```

## Import Pattern
Existing imports:
`import Component from '$components/Component.svelte'`

New imports:
`import Component from '$components/atoms/Component.svelte'`
`import Component from '$components/molecules/Component.svelte'`
`import Component from '$components/organisms/Component.svelte'`
