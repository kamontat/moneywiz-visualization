# Proposal: colorize-quick-summary

## Objective

Apply distinct semantic coloring to the Quick Summary cards to improve data readability.

## Description

The current Quick Summary cards share a uniform appearance, making it harder to scan for specific metrics. This plan involves updating the `QuickSummary` component to apply distinct color themes to the Income, Expenses, Net/Cash Flow, and Saving Rate cards. This will improve visual hierarchy and allow users to quickly identify positive and negative financial indicators.

## Acceptance Criteria

- [ ] Income card is styled with a green theme.
- [ ] Expense card is styled with a red theme.
- [ ] Net / Cash Flow card is styled with a blue theme.
- [ ] Saving Rate card is styled with a purple theme.
- [ ] All text maintains WCAG AA contrast ratios.
- [ ] Layout remains responsive on mobile devices.

## Out of Scope

- Changing the calculation logic of the metrics.
- Adding new metrics to the summary.

## References

