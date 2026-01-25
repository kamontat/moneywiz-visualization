# Design: Collapsible Category Panels

## Component: `CategoryBreakdown` (Organism)

### Structure
- Outer container: `flex flex-col gap-4`
- Individual panels:
  - Header: `flex items-center justify-between p-4 cursor-pointer select-none rounded-t-xl` (or fully rounded if closed)
  - Content: `overflow-hidden p-4 bg-mw-surface border-t-0 rounded-b-xl`

### Visuals
- **Income Panel**:
  - Header Background: `bg-emerald-50/50` or `bg-green-50`
  - Text: `text-emerald-900`
  - Icon color: `text-emerald-600`
- **Expense Panel**:
  - Header Background: `bg-rose-50/50` or `bg-red-50`
  - Text: `text-rose-900`
  - Icon color: `text-rose-600`
- **General**:
  - Border: `border border-mw-border`
  - Animation: Smooth height transition for expansion.

### Logic
- Use Svelte runes (`$state`) for managing open/closed state.
- Entire header is a `<button>` or has `role="button"` to ensure full-area clickability.
- Calculate category totals from `thbRows`.

## Layout Placement
- In `+page.svelte`, after `TopCategoriesChart` and `DailyExpensesChart`.

## Dependencies
- `$lib/analytics.ts` for category calculations.
- `$lib/finance.ts` for currency formatting.
