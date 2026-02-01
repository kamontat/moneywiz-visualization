# MoneyWiz Visualization

A Svelte-based web application for visualizing MoneyWiz CSV export data.

## Prerequisite

1. [Bun](https://bun.com/)

## Get start

1. Install dependencies: `bun install`
2. Start development server: `bun run dev`
3. Go to `http://localhost:5173`

### Commands

- To check styles: `bun run check`
- To fix styles: `bun run fix`
- To run unit-test: `bun run test:unit`
  - with coverage: `bun run test:coverage`
- To run e2e-test: `bun run test:e2e`
- To run all test: `bun run test`

### Debugging

Enable debug logs to troubleshoot issues:

1. On Terminal

```sh
DEBUG=moneywiz:* bun run dev       # All MoneyWiz logs
DEBUG=moneywiz:csv bun run dev     # CSV parser only
DEBUG=moneywiz:store:* bun run dev # Store operations
```

2. On Browser

```javascript
localStorage.debug = 'moneywiz:*' // All MoneyWiz logs
localStorage.debug = 'moneywiz:csv' // CSV parser only
localStorage.debug = '*' // All debug logs (includes 3rd-party)
```

### Building

1. To create a production build: `bun run build`
2. To preview the production build: `bun run preview`

## Project Structure

- `src/components/atoms/` - Basic building blocks
- `src/components/molecules/` - Simple component combinations
- `src/components/organisms/` - Complex UI sections
- `src/lib/` - Shared utilities and libraries
- `src/routes/` - Page routes
- `static/` - Static assets
- `e2e/` - Playwright end-to-end tests

## Deployment

Deploys to custom domain: https://moneywiz.kamontat.net/

- Uses `@sveltejs/adapter-static` for static site generation
- All pages are prerendered via `export const prerender = true`

## Features

- 📊 **Dashboard**: Financial overview with THB-only summary cards and charts
  - Income, Expenses, Net balance, and Saving Rate percentage
  - Top spending categories bar chart
  - Income vs Expenses trend visualization (Daily/Monthly)
  - **Date Filter**: Collapsible date range filter with quick presets (This Month, Last Month, Last 30 Days, This Year, Last Year, All Time)
  - **Income/Expense Split**: Separate collapsible panels for detailed category breakdowns
  - Clean empty state: "Dashboard" heading hidden until data is loaded
  - Loads default data on startup, reacts to CSV uploads
  - **Data Persistence**: Uploaded CSV data persists across page reloads via localStorage
- 📤 **CSV Upload**: Drag-and-drop or click to upload MoneyWiz CSV exports
  - Automatic `sep=` delimiter detection for MoneyWiz exports
  - BOM handling for proper encoding
  - Error handling with descriptive messages
  - **Data Preview Tab**: Inspect raw CSV data with configurable row limit (5-100 rows) and full filter support
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

## Tech Stack

- **Framework**: SvelteKit 5
- **Language**: TypeScript
- **Testing**: Playwright (e2e), Vitest (unit)
- **Linting**: ESLint with eslint-plugin-svelte
- **Formatting**: Prettier with prettier-plugin-svelte
- **Package Manager**: Bun
- **Build Tool**: Vite
