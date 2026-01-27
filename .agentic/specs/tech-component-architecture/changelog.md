# Changelog: tech-component-architecture

All notable changes to this specification.

## integrate-prettier-eslint

### Added

- ESLint validation requirement for all components
- Prettier formatting requirement for all components
- Reference to tech-code-quality spec for linting rules

---

## refactor-component-hierarchy

### Added

- Initial specification defining strict Atomic Design hierarchy
- Requirements for Atoms (Button, Title, Text, Container)
- Requirements for Molecules (UploadCsv, ClearCsv, Header, NavigationBar, DashboardPanel)
- Requirements for Organisms (Dashboard, AppHeader, PageTitle, QuickSummary, OverviewTab, PreviewTab, FilterPanel)
- Component file structure requirements with co-located tests
- Import rules and circular dependency prevention
- Component naming conventions
- Props and Snippet usage guidelines for Svelte 5 Runes
- Code examples for each component category

---
