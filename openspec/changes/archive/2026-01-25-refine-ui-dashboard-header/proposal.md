# Proposal: Refine UI Dashboard Heading and Header

## Why
1. The "Dashboard" heading remains visible even when no data is loaded, which creates a slightly cluttered look for a "blank canvas" state. Hiding it when empty provides a cleaner onboarding experience.
2. Users might want to see the source code or contribute. Adding a GitHub link to the header improves discoverability and follows common open-source app patterns.

## What Changes
- **Dashboard Heading**: Wrap the "Dashboard" `h1` in the `csv.data` check in `src/routes/+page.svelte`.
- **Layout Inversion**: Move the Dashboard (main content) above the CSV Preview table in the layout.
- **Collapsable Preview**: Make the CSV Preview table collapsable to save vertical space and focus on visualizations.
- **Header GitHub Link**: Add a GitHub icon link to the right side of the `AppHeader.svelte`, pointing to the project repository.
- **Visual consistency**: Ensure the GitHub icon matches the style of existing header buttons (minimal, clean).

## Impact
- **UX**: Cleaner landing page when no data is present. Better focus on data visualizations by moving the technical preview table to the bottom and making it collapsable.
- **Discoverability**: Easy access to the source code for users/developers.
- **Consistency**: Continues the "Minimalist/Modern" UI theme established in previous refactors.
