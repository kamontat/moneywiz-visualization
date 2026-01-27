---
name: web-designer
description: Inspect and fix MoneyWiz UI design issues. Use when fixing design/alignment issues, improving accessibility, correcting mobile layout breaks, or applying Tailwind CSS updates.
---

# Web Designer: MoneyWiz

## Project Styles

- **Framework**: Tailwind CSS v4.
- **Colors**:
  - Hot: Red, Orange, Yellow (Accents/Alerts).
  - Cool: Blue, Green (Primary/Secondary).
  - Neural: Gray, White.
- **Breakpoints**: Mobile (375px), Tablet (768px), Desktop (1280px).

## Workflow

1.  **Gather Info**: URL? (Usually `localhost:5173`).
2.  **Inspect**: Check the page visually. Use DevTools if needed.
3.  **Identify Component**: Find the `.svelte` file in `src/components/`.
4.  **Fix**: Update Tailwind classes.
5.  **Verify**: Check changes at relevant breakpoints.

## Common Fixes

- **Spacing**: Use `p-4`, `m-2`, `gap-4`.
- **Layout**: `flex`, `grid`.
- **Responsive**: `hidden md:block`, `w-full lg:w-1/2`.
