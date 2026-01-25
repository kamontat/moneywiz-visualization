# ui Specification

## Purpose
Defines the user interface requirements for the MoneyWiz Visualization application, including header design, component organization, dashboard behavior, and layout hierarchy to ensure a modern, accessible, and user-friendly experience.
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

### Requirement: Dashboard Cleanliness
The dashboard SHALL maintain a clean landing state when no data is provided.

#### Scenario: Hide title when dashboard is empty
- **Given** the user has not uploaded a CSV file
- **Then** the "Dashboard" heading SHOULD NOT be visible
- **And** an onboarding message SHOULD be displayed instead

### Requirement: External Links
The application SHALL provide access to its source code to facilitate developer engagement.

#### Scenario: GitHub link in header
- **Given** the application header is rendered
- **Then** it SHOULD include a link to the GitHub repository at the far right
- **And** the link MUST use the official GitHub icon
- **And** the link MUST open in a new tab

### Requirement: Document Layout Hierarchy
The application SHALL prioritize data visualizations and summaries with clear structural separation.

#### Scenario: Visualizations above raw data (Enhanced)
- **Given** a CSV file is successfully uploaded
- **Then** the Dashboard header MUST display the transaction date range on the top left
- **And** the "Dashboard" title MUST be centered at the top
- **And** a navigation tab system MUST be provided below the header
- **And** the "Quick Summary" (SummaryCards) MUST be separated from the chart panels within the "Overview" tab
- **And** the CSV Preview table MUST remain below the dashboard visualizations

### Requirement: User uploads CSV which persists across reloads
The application SHALL store the uploaded CSV data locally so that the user's session is preserved even if they refresh the page.

#### Scenario: Data survives reload
- GIVEN the user has uploaded "report.csv"
- WHEN the user reloads the page
- THEN the dashboard should still display the data from "report.csv"

#### Scenario: Clearing data
- GIVEN the user has persisted data
- WHEN the user clicks "Clear loaded CSV"
- THEN the data is removed from local storage
- AND the dashboard returns to the empty state

### Requirement: Visual Theme Palette
The application SHALL use a consistent professional color palette focused on financial clarity.

#### Scenario: Primary and Secondary Color Palette
- **Given** the application is rendered
- **Then** the primary brand color MUST be a professional blue (`#60a5fa`)
- **And** the secondary brand color MUST be a professional purple (`#9333ea`)
- **And** these colors MUST be used consistently across branding elements (logo, buttons)
- **And** data visualizations SHOULD use the theme colors, except where semantic colors provide better clarity (e.g., green for income, red for expenses)

