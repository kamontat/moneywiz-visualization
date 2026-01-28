# Proposal: refactor-csv-reader

## Objective

Refactor the CSV file reader to parse raw MoneyWiz data into structured domain objects before saving to the store.

## Description

The current system reads CSV files as raw arrays of strings. To enable better visualization and filtering, we need to parse specific MoneyWiz fields (Accounts, Categories, Tags, Dates) into structured objects immediately upon ingestion. This will centralize parsing logic and ensure data consistency across the application.

## Acceptance Criteria

- [ ] Categories are parsed into `category` and `subcategory` (separated by `>`)
- [ ] Tags are parsed into a list of objects with `group` and `name` (separated by `;`)
- [ ] Date and Time columns are aggregated into a single JavaScript `Date` object
- [ ] Account strings are parsed into `name`, `extra`, and `type` (e.g., `Name Extra (Type)`)
- [ ] Account parsing supports all specified types: A, C, D, L, I, CT
- [ ] Existing CSV reading functionality remains intact but returns structured data
- [ ] Unit tests cover all parsing edge cases

## Out of Scope

- Saving data to a persistent database (store-only for now)
- Changing the CSV export format from MoneyWiz

## References

- [MoneyWiz Export Format](N/A)
