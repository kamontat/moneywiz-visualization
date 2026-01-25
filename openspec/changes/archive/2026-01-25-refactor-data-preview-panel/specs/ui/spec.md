# ui Specification Delta: Data Preview Improvements

## ADDED Requirements

### Requirement: Interactive Data Preview Panel
The application SHALL utilize a dedicated component for the data preview table that aligns with the dashboard's interactive patterns.

#### Scenario: Consistent Interactive Header
- **Given** the data preview panel is visible
- **Then** the panel header MUST have rounded corners (`rounded-xl` when collapsed)
- **And** the entire header area MUST be clickable to toggle expansion
- **And** the background color SHOULD be neutral (`gray-50` family) to differentiate from income/expense panels
- **And** the panel state SHOULD default to collapsed
