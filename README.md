# MoneyWiz Visualization

A Svelte-based web application for visualizing MoneyWiz CSV export data.

## Getting Started

### Development Server

```sh
bun run dev
```

The dev server runs on `http://localhost:5173` (or next available port).

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

- 📤 Upload MoneyWiz CSV files
- 📊 Parse and prepare data for visualization
- 🎨 Professional, accessible UI
- 📱 Responsive design

## Tech Stack

- **Framework**: SvelteKit 5
- **Language**: TypeScript
- **Testing**: Playwright (e2e), Vitest (unit)
- **Package Manager**: Bun
- **Build Tool**: Vite
