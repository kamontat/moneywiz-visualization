## MODIFIED Requirements

### Requirement: Overview Tab Layout
The Overview tab SHALL serve as the primary view for financial analysis, presenting key metrics and controls clearly, while keeping raw data in a separate Preview tab.

#### Scenario: Header and Controls
- **Given** a CSV file is successfully uploaded
- **Then** the Dashboard header MUST display the transaction date range on the top left
- **And** the "Dashboard" title MUST be displayed at the top
- **And** a navigation tab system MUST be provided below the header to switch between different views
- **And** the tab navigation MUST include "Overview" and "Preview" tabs
- **And** the Overview tab MUST display visualizations and summary cards only
- **And** the Overview tab MUST NOT display the raw data preview table
