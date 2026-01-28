# Tasks: colorize-quick-summary

Technical implementation steps for the proposal.

## Prerequisites

- [ ] Repository is clean and up to date.

## Implementation Steps

### Step 0: Define color variants
Define color variants for summary cards

Create a mapping or prop structure in `QuickSummary.svelte` to handle different color themes (background, border, text). We will use Tailwind CSS classes like `bg-green-50`, `border-green-200`, `text-green-700` for the themes.

**Files to modify:**
- src/components/organisms/QuickSummary.svelte

**Changes:**
- Add a helper function or object to map metric types to color classes.
- Refactor the markup to use these dynamic classes instead of the static `cardClass`.

### Step 1: Style Income and Expense cards
Apply the green theme to the Income card and the red theme to the Expense card.

**Files to modify:**
- src/components/organisms/QuickSummary.svelte

**Changes:**
- Update Income card to use Green variant.
- Update Expenses card to use Red variant.

### Step 2: Style Net and Saving Rate cards
Apply the blue theme to the Net card and purple theme to the Saving Rate card. Ensure text contrast is sufficient.

**Files to modify:**
- src/components/organisms/QuickSummary.svelte

**Changes:**
- Update Net / Cash Flow card to use Blue variant.
- Update Saving Rate card to use Purple variant.

## Verification

- [ ] Visual inspection shows four distinct colors.
- [ ] `bun run check` passes.
- [ ] `bun run test:unit` passes.
