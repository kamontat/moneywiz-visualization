# Proposal: Currency Symbol Formatting

## Why
Current currency formatting uses standard `Intl.NumberFormat` with `style: 'currency'`, which often results in currency codes (like "THB") or symbols in inconsistent positions depending on the locale. The user specifically wants currency to be shown using symbols (e.g., ฿, $, €) instead of codes, providing a more professional and concise financial visualization.

## What Changes
1.  **Update `formatTHB` Utility**: Modify the `formatTHB` function in `src/lib/finance.ts` to ensure it uses the appropriate currency symbol.
2.  **UI Specification**: Add a requirement to the `ui-design` spec to mandate the use of currency symbols for all financial amounts.
3.  **Global Formatting Strategy**: Ensure that all currency displays across the dashboard (Summary Cards, Category Breakdown, Charts) use this updated formatting.

## Impact
- **Consistency**: All financial amounts will use symbols consistently.
- **Conciseness**: Symbols are shorter than currency codes, saving space on small screens.
- **Professionalism**: Better alignment with standard financial dashboard aesthetics.
