## ADDED Requirements

### Requirement: Specification Deprecation Notice
This specification has been split into more focused capabilities. Users MUST consult the new specifications for current UI requirements.

#### Scenario: Redirect to new specifications
- **GIVEN** a developer needs UI requirements
- **THEN** they MUST consult the following specifications instead of this one:
  - `csv-logic`: For data persistence and CSV interaction logic
  - `ui-design`: For core UI elements, theming, header, and global layout
  - `quick-summary-design`: For the quick summary section design
  - `overview-tab-design`: For Overview tab layout and components
- **AND** this specification is maintained only for backward compatibility and SHALL NOT be updated with new requirements

## REMOVED Requirements

### Requirement: Header Action Buttons
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.

### Requirement: Component Organization
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.

### Requirement: Modern Header Aesthetics
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.

### Requirement: Dashboard Cleanliness
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.

### Requirement: External Links
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.

### Requirement: Document Layout Hierarchy
**Reason**: Split between `ui-design`, `quick-summary-design`, and `overview-tab-design`.
**Migration**: See respective new specifications.

### Requirement: User uploads CSV which persists across reloads
**Reason**: Moved to `csv-logic` spec.
**Migration**: See `csv-logic` specification.

### Requirement: Visual Theme Palette
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.

### Requirement: Collapsible Category Breakdown
**Reason**: Moved to `overview-tab-design` spec.
**Migration**: See `overview-tab-design` specification.

### Requirement: Interactive Data Preview Panel
**Reason**: Moved to `ui-design` spec.
**Migration**: See `ui-design` specification.
