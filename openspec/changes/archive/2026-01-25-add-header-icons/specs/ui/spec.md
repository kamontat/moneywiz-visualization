# Spec: Header UI Enhancements

## ADDED Requirements

### Requirement: Header Action Buttons
The header action buttons SHALL provide clear visual cues for their functionality using both text and icons.

#### Scenario: Display icons in header buttons
- **Given** the application header is rendered
- **Then** the "Upload CSV" button should display an upload icon alongside the text
- **And** if a CSV is loaded, the "Clear" button should display a clear/trash icon alongside the text
- **And** both icons must be properly aligned with the button text
- **And** both icons must have `aria-hidden="true"` to skip assistive technology
