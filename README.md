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

**Note:** Always use `bun` as the package manager and command runner (not `npm` or `npx`).

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

- `src/components/` - Reusable UI components
  - `AppHeader.svelte` - Main header with logo and CSV upload
  - `CsvUploadButton.svelte` - CSV file upload handler
  - `MoneyLogo.svelte` - App logo component
- `src/lib/csv.ts` - CSV parsing utilities
- `src/routes/` - Page routes
- `static/` - Static assets

## Deployment

Deploys to custom domain: https://moneywiz.kamontat.net/

- Uses `@sveltejs/adapter-static` for static site generation
- All pages are prerendered via `export const prerender = true`
- No base path configuration needed (root-level deployment)

## Features

- 📤 **CSV Upload**: Drag-and-drop or click to upload MoneyWiz CSV exports
  - Automatic `sep=` delimiter detection for MoneyWiz exports
  - BOM handling for proper encoding
  - Real-time preview of uploaded data (first 5 rows)
- 📊 **Data Parsing**: Robust CSV parser with quoted field support
- 🎨 **Professional UI**: Clean, accessible design with success/error feedback
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
