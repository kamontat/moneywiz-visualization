# Tasks: refactor-csv-reader

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Verify `src/lib/csv.ts` exists

## Implementation Steps

### Step 0: Define Interfaces
Define TypeScript interfaces for the structured data.
**Files to modify:**
- `src/lib/types.ts` (or new file)
**Changes:**
- Add `AccountType` enum/union (`A`, `C`, `D`, `L`, `I`, `CT`)
- Add `ParsedAccount` interface (`name`, `extra`, `type`)
- Add `ParsedTag` interface (`group`, `name`)
- Add `ParsedCategory` interface (`root`, `sub`)
- Add `MoneyWizTransaction` interface combining these fields

### Step 1: Implement Field Parsers
Create pure functions to parse individual fields.
**Files to modify:**
- `src/lib/csv.ts`
**Changes:**
- Implement `parseCategory(raw: string): { root: string, sub: string }`
- Implement `parseTags(raw: string): ParsedTag[]`
- Implement `parseDate(dateStr: string, timeStr: string): Date`
- Implement `parseAccount(raw: string): ParsedAccount`

### Step 2: Implement Row Transformer
Create a function to transform a raw CSV row into a `MoneyWizTransaction`.
**Files to modify:**
- `src/lib/csv.ts`
**Changes:**
- Create `transformRow(row: CsvRow): MoneyWizTransaction`
- Handle locale-specific number formatting (e.g., removing commas)
- Integrate field parsers

### Step 3: Integrate with CSV Reader
Update the main CSV parsing function to use the transformer.
**Files to modify:**
- `src/lib/csv.ts`
**Changes:**
- Update `parseCsvFile` (or create a new `parseMoneyWizReport`) to return `MoneyWizTransaction[]` instead of raw rows

## Verification

- [ ] Run unit tests for field parsers
- [ ] Import a sample CSV in the app
- [ ] Verify data appears correctly in the console or UI
