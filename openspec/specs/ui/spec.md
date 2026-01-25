# ui Specification

## Purpose
TBD - created by archiving change add-header-icons. Update Purpose after archive.
## Requirements
### Requirement: Header Action Buttons
The header action buttons SHALL provide clear visual cues for their functionality using both text and icons.

#### Scenario: Display icons in header buttons
- **Given** the application header is rendered
- **Then** the "Upload CSV" button should display an upload icon alongside the text
- **And** if a CSV is loaded, the "Clear" button should display a clear/trash icon alongside the text
- **And** both icons must be properly aligned with the button text
- **And** both icons must have `aria-hidden="true"` to skip assistive technology

### Requirement: Component Organization
The application SHALL follow the Atomic Design methodology for organizing UI components to ensure hierarchy and maintainability.

#### Scenario: Categorize components into atoms, molecules, and organisms
- **Given** the `src/components/` directory
- **Then** foundational blocks like logos and basic elements should be in `atoms/`
- **And** simple combinations like specialized buttons should be in `molecules/`
- **And** complex sections like headers and charts should be in `organisms/`
- **And** all components must include their test files in the same subdirectory

