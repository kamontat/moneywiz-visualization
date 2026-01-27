# Spec: biz-ui-design

## Purpose

Defines the core user interface requirements for the MoneyWiz Visualization application, including header design, component organization, dashboard behavior, theming, and layout patterns to ensure a modern, accessible, and user-friendly experience.

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
- **Then** foundational blocks (Button, Title, Text, Container) MUST be in `atoms/`
- **And** composition components (UploadCsv, ClearCsv, Header, NavigationBar, DashboardPanel) MUST be in `molecules/`
- **And** complex sections (Dashboard, PageTitle, QuickSummary, OverviewTab, PreviewTab, FilterPanel, CategoryBreakdown) MUST be in `organisms/`
- **And** all components MUST include their test files co-located in the same subdirectory
- **And** component hierarchy MUST follow strict Atomic Design principles as defined in tech-component-architecture spec

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

### Requirement: Visual Theme Palette

The application SHALL use a consistent professional color palette focused on financial clarity.

#### Scenario: Primary and Secondary Color Palette

- **Given** the application is rendered
- **Then** the primary brand color MUST be a professional blue (`#60a5fa`)
- **And** the secondary brand color MUST be a professional purple (`#9333ea`)
- **And** these colors MUST be used consistently across branding elements (logo, buttons)
- **And** data visualizations SHOULD use the theme colors, except where semantic colors provide better clarity (e.g., green for income, red for expenses)

### Requirement: Dashboard Tab Navigation

The application SHALL provide a tabbed interface for organizing dashboard content into distinct views.

#### Scenario: Tab-based content organization

- **Given** a CSV file is successfully uploaded
- **Then** a tab navigation bar MUST be displayed with "Overview" and "Preview" tabs
- **And** the "Overview" tab MUST be selected by default
- **And** clicking a tab MUST switch the visible content below
- **And** tab switching MUST preserve filter state
- **And** the active tab MUST be visually distinguished with the primary color

### Requirement: General Dashboard Layout

The application SHALL prioritize data visualizations and summaries with clear structural separation.

#### Scenario: Visualizations above raw data

- **Given** a CSV file is successfully uploaded
- **Then** the CSV Preview table MUST remain below the dashboard visualizations
- **And** the dashboard visualizations MUST be presented in a tabbed interface or clearly separated sections

### Requirement: Dashboard Information Hierarchy

The application SHALL provide clear and concise information about the loaded data.

#### Scenario: Upload status presentation

- **Given** a CSV file is successfully uploaded
- **Then** the file name MUST be displayed above the "Upload successful" message in the status section
- **And** the file name SHOULD be styled with a smaller, secondary prominence compared to the main status
- **And** the "Upload successful" message SHOULD be clearly visible as a status indicator

### Requirement: Responsive Grid System

The application SHALL use a fluid grid system that adapts complex visualizations to different screen sizes.

#### Scenario: Dashboard Stacking Order

- **Given** the viewport is resized to mobile width (< 640px)
- **Then** multi-column grid layouts MUST collapse into a single vertical column
- **And** the stacking order MUST preserve logical flow: Category Splits -> Trend Charts -> Top Categories
- **And** consistent vertical spacing (`gap-4` or similar) MUST be maintained between stacked components

### Requirement: Currency Symbol Representation

The application SHALL represent financial values using currency symbols instead of ISO codes to maximize space and readability.

#### Scenario: Display currency as symbols

- **Given** a financial value needs to be displayed
- **Then** it MUST use the appropriate currency symbol (e.g., "฿" for THB)
- **And** it SHOULD NOT use the ISO currency code (e.g., "THB")
- **And** the symbol position MUST follow standard local conventions (e.g., "฿1,000.00")

## Constraints

- Must follow Atomic Design methodology (atoms, molecules, organisms)
- Header must be responsive and work on mobile (< 640px) and desktop
- All interactive elements must be accessible (proper ARIA attributes)
- Color palette must maintain sufficient contrast for readability

## Examples

## Notes

This spec covers general UI/UX patterns applied across the application. Component-specific layouts are covered in their respective specs (biz-overview-tab, biz-preview-tab, biz-quick-summary).
