# Tests: refactor-csv-reader

Test plan for validating the implementation.

## Unit Tests

- [ ] `parseCategory` correctly splits "Main > Sub"
- [ ] `parseCategory` handles missing subcategory
- [ ] `parseTags` correctly parses single and multiple tags
- [ ] `parseTags` handles empty tags
- [ ] `parseDate` correctly combines Date and Time strings
- [ ] `parseAccount` extracts Name, Extra, and Type correctly
- [ ] `parseAccount` handles accounts without extra info
- [ ] `parseAccount` handles all account types (A, C, D, L, I, CT)

## Integration Tests

- [ ] `parseMoneyWizReport` correctly parses a full CSV string into `MoneyWizTransaction` objects
- [ ] Validates that numeric strings (Amounts) are correctly parsed to numbers

## E2E Tests

- [ ] Uploading a CSV file in the UI results in parsed data availability (can check via store state or debug output)

## Manual Testing

1. Open the application
2. Upload `static/data/report.csv`
3. Check console/logs to see structure of parsed objects
4. Verify that dates look correct (not Invalid Date)
5. Verify that Account Types are correctly identified

## Edge Cases

- [ ] Empty CSV file
- [ ] CSV with missing columns
- [ ] Date format variations (if supported)
- [ ] Account names with parentheses inside specific fields
