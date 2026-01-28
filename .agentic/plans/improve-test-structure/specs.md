# Affected Specs: improve-test-structure

List of specifications affected by this change.

## Modified Specs

| Spec | Change Type | Description |
|------|-------------|-------------|
| [tech-code-quality](../../specs/tech-code-quality/spec.md) | modification | Add section clarifying that route-level logic should be tested via E2E in `e2e/` rather than co-located unit tests, and that test data must be isolated. |

## New Specs

| Spec | Purpose |
|------|---------|
| [tech-testing-strategy](../../specs/tech-testing-strategy/spec.md) | Define global testing strategy: Unit (components) vs E2E (routes/flows), and Data Management (dynamic vs static). |

## Deprecated Specs

| Spec | Reason | Replacement |
|------|--------|-------------|
| N/A | | |

## No Changes

- biz-filtering: Functional requirements unchanged.
- biz-overview-tab: Functional requirements unchanged.
- biz-preview-tab: Functional requirements unchanged.
- biz-quick-summary: Functional requirements unchanged.
- biz-ui-design: UI requirements unchanged.
- tech-component-architecture: Component structure unchanged.
- tech-csv-logic: CSV parsing logic unchanged, only how it's fed in tests.
