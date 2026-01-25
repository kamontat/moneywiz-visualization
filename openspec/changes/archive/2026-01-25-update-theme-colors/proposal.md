# Proposal: Update Project Theme Colors

## Why
Update the application's visual theme from the current green-based palette to a professional blue and purple palette.

## Problem Statement
The current theme uses an emerald/green primary color which was the initial choice. To align with a more standard financial application look, we want to transition to a blue primary color with purple as a secondary accent color.

## What Changes
- Update `--color-mw-primary` and `--color-mw-primary-dark` CSS variables in `src/routes/layout.css`.
- Introduce `--color-mw-secondary` and `--color-mw-secondary-dark` CSS variables.
- Update UI components that use these colors (e.g., gradients in `MoneyLogo.svelte`, `CsvUploadButton.svelte`, and charts).
- Ensure consistent use of blue/purple across the dashboard.

## Impact
- **Visuals**: Modernized look and feel.
- **Consistency**: Centralized secondary color definition rather than relying only on primary or text-secondary.
- **Charts**: Updated chart colors to reflect the new theme.
