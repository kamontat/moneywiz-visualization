# ui Specification

## Purpose
TBD - created by archiving change add-header-icons. Update Purpose after archive.
## Requirements
### Requirement: Header Action Buttons
The header action buttons SHALL provide clear visual cues for their functionality using both text and icons.

#### Scenario: Display icons in header buttons
- **Given** the application header is rendered
- **Then** the "Upload CSV" button should display an upload icon
- **And** if a CSV is loaded, the "Clear" button should display a clear/trash icon
- **And** on mobile screens, these buttons MUST hide their text labels and show ONLY icons
- **And** on desktop screens, these buttons SHOULD show both icons and text labels
- **And** both icons must have `aria-hidden="true"` to skip assistive technology

### Requirement: Component Organization
The application SHALL follow the Atomic Design methodology for organizing UI components to ensure hierarchy and maintainability.

#### Scenario: Categorize components into atoms, molecules, and organisms
- **Given** the `src/components/` directory
- **Then** foundational blocks like logos and basic elements should be in `atoms/`
- **And** simple combinations like specialized buttons should be in `molecules/`
- **And** complex sections like headers and charts should be in `organisms/`
- **And** all components must include their test files in the same subdirectory

### Requirement: Modern Header Aesthetics
The application SHALL implement a modern, responsive single-line header with glassmorphism effects.

#### Scenario: Apply glassmorphism and sticky behavior
- **Given** the user scrolls the page
- **Then** the header should stay fixed at the top
- **And** the header background should have a backdrop blur effect
- **And** the header should be semi-transparent

#### Scenario: Optimize mobile layout
- **Given** a mobile viewport (width < 640px)
- **Then** the header MUST remain as a single horizontal line
- **And** the brand title "MoneyWiz Report" should be displayed as a clickable link to home
- **And** the header SHOULD NOT include a standalone logo component

