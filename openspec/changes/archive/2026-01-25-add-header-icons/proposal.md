# Proposal: Add Icons to Header Buttons

## Status
- **ID**: add-header-icons
- **Status**: Proposed
- **Author**: GitHub Copilot
- **Date**: 2026-01-25

## Why
The header navigation buttons ("Upload CSV" and "Clear") currently only have text labels. Adding icons would improve the visual hierarchy, make the actions more recognizable, and align the UI with modern design standards.

## What Changes
- Integrate Iconify using the **SVG + CSS** Svelte components for maximum reliability and modern browser optimization.
- Use the `@iconify-svelte/lucide` package for high-quality, lightweight icons.
- Import specific icon components (e.g., `UploadIcon`, `TrashIcon`) directly into Svelte files.
- Ensure proper spacing and alignment using Tailwind CSS utility classes.

## Acceptance Criteria
- [ ] The `@iconify-svelte/lucide` package is installed as a devDependency.
- [ ] The "Upload CSV" button includes a visible `UploadIcon`.
- [ ] The "Clear" button includes a visible `TrashIcon` (lucide:trash-2).
- [ ] Icons are properly aligned with the text using `flex` or `inline-flex`.
- [ ] Icons are accessible (aria-hidden="true").
- [ ] Buttons maintain their responsive behavior.
- [ ] Hover and focus states correctly highlight both text and icons.

## Alternative Solutions
- Using inline SVGs, but Iconify is more maintainable and allows for easier icon discovery.
- Using `lucide-svelte`, but Iconify allows using icons from multiple sets if needed in the future.
