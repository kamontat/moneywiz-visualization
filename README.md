# MoneyWiz Visualization

A Svelte-based web application for visualizing MoneyWiz CSV export data.

## Getting Started

### Development Server

```sh
bun run dev
```

The dev server runs on `http://localhost:5173` (or next available port).

**Tip:** Before starting a new dev server, check if http://localhost:5173/ is already running to reuse the existing instance and avoid port conflicts.

### Testing

Run the full test suite:

```sh
bun test
```

Run server-side tests only (includes CSV parser):

```sh
bun vitest run --project=server
```

Run client-side tests only (Svelte components):

```sh
bun vitest run --project=client
```

**Note:** Always use `bun` as the package manager and command runner (not `npm`, `npx`, or `bunx`).

### Debugging

Enable debug logs to troubleshoot issues:

**Terminal:**
```sh
DEBUG=moneywiz:* bun run dev       # All MoneyWiz logs
DEBUG=moneywiz:csv bun run dev     # CSV parser only
DEBUG=moneywiz:store:* bun run dev # Store operations
```

**Browser Console:**
```javascript
localStorage.debug = 'moneywiz:*'   // All MoneyWiz logs
localStorage.debug = 'moneywiz:csv' // CSV parser only
localStorage.debug = '*'            // All debug logs (includes 3rd-party)
```

**Available Namespaces:**
- `moneywiz:csv` - CSV parsing operations
- `moneywiz:store:csv` - CSV store updates
- `moneywiz:component:upload` - Upload button interactions
- `moneywiz:page:dashboard` - Dashboard rendering
- `moneywiz:fetch` - Data fetching

After setting `localStorage.debug`, refresh the page to apply changes.

### Building

To create a production build:

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

## Project Structure

- `src/components/` - Reusable UI components (organized using Atomic Design)
  - `atoms/` - Basic building blocks
    - `MoneyLogo.svelte` - App logo component
  - `molecules/` - Simple component combinations
    - `CsvUploadButton.svelte` - CSV file upload handler
  - `organisms/` - Complex UI sections
    - `AppHeader.svelte` - Main header with logo and CSV upload
    - `SummaryCards.svelte` - Dashboard summary cards (Income, Expenses, Net, Transactions)
    - `TopCategoriesChart.svelte` - Bar chart for top spending categories
    - `DailyExpensesChart.svelte` - Bar chart for daily expenses
    - `IncomeExpenseRatioChart.svelte` - Pie chart for income vs expenses ratio
- `src/lib/` - Shared utilities and libraries
  - `csv.ts` - CSV parsing with error handling
  - `analytics.ts` - Financial analytics calculations (totals, categories, daily expenses)
  - `finance.ts` - Financial data parsing and formatting utilities
  - `debug.ts` - Debug logging with namespace filtering
  - `stores/` - Svelte stores (CSV state management)
- `src/routes/` - Page routes
- `static/` - Static assets
- `e2e/` - Playwright end-to-end tests

## Deployment

Deploys to custom domain: https://moneywiz.kamontat.net/

- Uses `@sveltejs/adapter-static` for static site generation
- All pages are prerendered via `export const prerender = true`
- No base path configuration needed (root-level deployment)

## Features

- 📊 **Dashboard**: Financial overview with THB-only summary cards and charts
  - Income, Expenses, Net balance, and Saving Rate percentage
  - Top spending categories bar chart
  - Daily expenses trend visualization
  - Clean empty state: "Dashboard" heading hidden until data is loaded
  - Loads default data on startup, reacts to CSV uploads
  - **Data Persistence**: Uploaded CSV data persists across page reloads via localStorage
- 📤 **CSV Upload**: Drag-and-drop or click to upload MoneyWiz CSV exports
  - Automatic `sep=` delimiter detection for MoneyWiz exports
  - BOM handling for proper encoding
  - Error handling with descriptive messages
  - Preview table with collapse toggle (collapsed by default to focus on visualizations)
  - **Persistent Storage**: Data survives page refreshes and browser restarts
  - **Clear Data**: One-click button to remove persisted data and return to empty state
- 📊 **Data Parsing**: Robust CSV parser with quoted field support and validation
- 🐛 **Debug Logging**: Comprehensive logging system with namespace filtering
  - Enable via `DEBUG=moneywiz:* bun run dev` (terminal)
  - Or `localStorage.debug = 'moneywiz:*'` (browser)
- 🎨 **Professional UI**: Clean, accessible design with success/error feedback
  - Modern glassmorphism header with sticky positioning
  - GitHub repository link for easy access to source code
  - Optimized layout: visualizations prioritized above raw data preview
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## CSV Format

The app supports MoneyWiz CSV exports with the following format:

```csv
sep=,
"Account","Transfers","Description","Payee","Category","Date","Time","Memo","Amount","Currency","Check #","Tags"
"Wallet A","Wallet B","Transfer to Wallet B","","","23/01/2026","21:18","","173,250.46","THB","",""
```

- Leading `sep=` line is automatically detected and respected
- Supports quoted fields with embedded commas and quotes
- BOM (Byte Order Mark) is automatically stripped

## Tech Stack

- **Framework**: SvelteKit 5
- **Language**: TypeScript
- **Testing**: Playwright (e2e), Vitest (unit)
- **Package Manager**: Bun
- **Build Tool**: Vite
