# Design: Update Project Theme Colors

## Technical Architecture
The project uses Tailwind CSS v4 which defines theme variables in `src/routes/layout.css` under the `@theme` block.

## Design Decisions

### Color Palette
- **Primary (Blue)**:
  - `mw-primary`: `#60a5fa` (Tailwind Blue 400)
  - `mw-primary-dark`: `#3b82f6` (Tailwind Blue 500)
- **Secondary (Purple)**:
  - `mw-secondary`: `#9333ea` (Tailwind Purple 600)
  - `mw-secondary-dark`: `#7e22ce` (Tailwind Purple 700)

### Component Updates
1. **MoneyLogo.svelte**:
   - Change gradient from `from-mw-primary to-emerald-500` to `from-mw-primary to-mw-secondary`.
   - Update shadow color from `shadow-emerald-500/20` to `shadow-mw-primary/20`.

2. **CsvUploadButton.svelte**:
   - Update gradient and shadow colors to use blue shades.
   - Update focus outline.

3. **Charts**:
   - **DailyExpensesChart.svelte**: Use `mw-primary` (Blue).
   - **TopCategoriesChart.svelte**: Use `mw-primary` (Blue).
   - **IncomeExpenseRatioChart.svelte**: Keep income arc green (Emerald-400 to Emerald-500) for semantic clarity, expenses remain red. Savings rate uses green when positive.

4. **Dashboard Page**:
   - Update "Dashboard" title text color.
   - Update tab selection borders to use `mw-primary`.

## Alternatives Considered
- Initially used Blue-600 (#2563eb), but switched to Blue-400 (#60a5fa) for a lighter, more modern appearance.
- Considered using blue for income chart, but kept green for semantic clarity (income=positive=green).
- Using indigo as primary, but true blue is more "MoneyWiz"-like.

## Security & Performance
No impact on security or performance. Minimal CSS change.
