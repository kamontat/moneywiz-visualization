---
name: web-e2e-tester
description: Comprehensive guide for end-to-end testing of the MoneyWiz SvelteKit application using Playwright. Use for verifying user flows, UI scenarios, and visual consistency.
---

# MoneyWiz Web E2E Testing (Playwright)

This skill is the definitive guide for generating, updating, and debugging **Playwright** end-to-end tests.

## When to Use This Skill

- **New Scenarios**: When a new user story or feature is added (e.g., a new chart type or export option).
- **Scenario Updates**: When existing UI flows change (e.g., button moves, modal flow changes).
- **UI Refactoring**: When Tailwind CSS classes or layouts change significantly.
- **Regression Testing**: When ensuring that logic changes didn't break the actual browser experience.
- **Debugging UI**: When analyzing screenshots, accessibility trees, or console errors from a live browser session.

## Test Writing Guidelines

### 1. Code Quality Standards

- **Locators**: Prioritize user-facing, role-based locators (`getByRole`, `getByLabel`, `getByText`). Use `test.step()` to group interactions.
- **Assertions**: Use auto-retrying web-first assertions: `await expect(locator).toHaveText()`.
- **Timeouts**: Trust auto-waiting. **NEVER** use `waitForTimeout`.
- **Titles**: Describe the _user scenario_ (e.g., "Feature - User can clear uploaded CSV data").

### 2. File Organization

- **Location**: `e2e/` directory.
- **Naming**: `<feature>.spec.ts`.
- **Hooks**: Use `test.beforeEach` to navigate to the app or set up initial state.

### 3. Assertion Best Practices

- **UI Structure**: Use `toMatchAriaSnapshot` for accessibility tree verification.
- **Navigation**: `await expect(page).toHaveURL(...)`.

## Execution & Debugging

| Action             | Command                    |
| :----------------- | :------------------------- |
| **Run E2E Tests**  | `bun run test:e2e`         |
| **Interactive UI** | `bun run test:e2e --ui`    |
| **Debug Mode**     | `bun run test:e2e --debug` |

### Debugging Steps

- **Server**: Ensure `bun run dev` is active (check `http://localhost:5173`).
- **Traces**: Use Playwright's trace viewer for analysis.
- **Console**: Monitor logs using `page.on('console', msg => ...)`.

## MoneyWiz Specific E2E Scenarios

- **CSV Upload Flow**: Test the interaction of picking a file -> progress -> dashboard update.
- **Chart Interactions**: Verify Canvas rendering and legend visibility.
- **Layout Consistency**: Use `setViewportSize` to test Mobile (375px), Tablet (768px), and Desktop (1280px).
- **Reset Logic**: Test the "Clear" button resets all charts and data stores.

## Quality Checklist

- [ ] Role-based locators are used exclusively if possible.
- [ ] `test.step` groups logical parts of the scenario.
- [ ] No hard-coded waits.
- [ ] Screenshots or snapshots are used where visual verification is critical.
- [ ] Responsive behavior is verified at standard project breakpoints.
