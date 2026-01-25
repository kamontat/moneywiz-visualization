# Design: Modern Mobile-First Header

## Architectural Decisions

### 1. Sticky Glassmorphism
The header will remain sticky at the top, but will change from a solid color to a semi-transparent background with a backdrop blur. This allows content to scroll under it while keeping navigation accessible and maintaining a modern aesthetic.

- **Classes**: `bg-white/80 dark:bg-mw-surface-alt/80 backdrop-blur-md`
- **Rationale**: Standard modern web pattern that adds depth without clutter.

### 2. Mobile Layout Strategy
The header will strictly adhere to a single-line horizontal layout across all screen sizes. Vertical stacking is removed to maximize vertical space for content.

- **Branding**: The title is shortened to "MoneyWiz Report" and serves as a home link. The standalone Logo component is removed to save space on mobile.
- **Responsive Elements**:
  - Buttons (Upload, Clear) will use CSS classes (e.g., `hidden sm:inline`) to hide text labels on small screens, showing only icons.
  - The layout uses `justify-between` and `items-center` on a single `flex-row` container.

### 3. Visual Refinement
- **Border**: Use a more subtle `border-mw-border/50`.
- **Shadow**: Add a soft `shadow-sm` during scroll (or always if blur is used).
- **Typography**: Slightly adjust letter-spacing and weight for a more "app-like" feel.

## Component Changes

### AppHeader.svelte
- Update class strings for the main `<header>` element.
- Refine the branding section for responsiveness.
- Adjust button group layout.
- Remove `MoneyLogo` usage.

## Testing Strategy
- **Visual**: Manual check on mobile view and desktop.
- **E2E**: Verify buttons remain clickable and title link is working.
- **Unit**: Ensure props and event handlers still function.
