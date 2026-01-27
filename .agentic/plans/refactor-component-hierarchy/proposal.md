# Proposal: refactor-component-hierarchy

## Objective

Refactor the component structure to strictly follow Atomic Design principles as specified, introducing base atoms, molecules, and organisms.

## Description

The project currently follows a partial Atomic Design structure. This plan aims to standardize the component hierarchy by creating generic base components (Atoms), composition components (Molecules), and high-level section components (Organisms) according to specific definitions. This refactoring will improve reusability, maintainability, and consistency across the application.

## Acceptance Criteria

- [ ] Create generic Atoms: `Container`, `Button`, `Title`, `Text`
- [ ] Create Molecules: `UploadCsv`, `ClearCsv`, `NavigationItem`, `DashboardContainer`, `DashboardPanel`, `Header`, `NavigationBar`
- [ ] Create Organisms: `PageTitle`, `Dashboard`, `QuickSummary`, `FilterPanel`, `OverviewTab`, `PreviewTab`
- [ ] Move existing components to their new classifications and rename/refactor as strictly required
- [ ] Update all imports and usages
- [ ] Ensure application visual regression is minimal (functionality remains identical)

## Out of Scope

- Functional changes or new features
- Visual redesigns (changes are structural only)

## References

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
