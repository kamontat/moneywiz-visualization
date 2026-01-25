# ui Specification Delta (refine-dashboard-layout)

## MODIFIED Requirements

### Requirement: Document Layout Hierarchy
The application SHALL prioritize data visualizations and summaries with clear structural separation.

#### Scenario: Visualizations above raw data (Enhanced)
- **Given** a CSV file is successfully uploaded
- **Then** the Dashboard header MUST display the transaction date range on the top left
- **And** the "Dashboard" title MUST be centered at the top
- **And** a navigation tab system MUST be provided below the header
- **And** the "Quick Summary" (SummaryCards) MUST be separated from the chart panels within the "Overview" tab
- **And** the CSV Preview table MUST remain below the dashboard visualizations

## NEW Requirements

### Requirement: Dashboard Information Hierarchy
The application SHALL provide clear and concise information about the loaded data.

#### Scenario: Upload status presentation
- **Given** a CSV file is successfully uploaded
- **Then** the file name MUST be displayed above the "Upload successful" message in the status section
- **And** the file name SHOULD be styled with a smaller, secondary prominence compared to the main status
- **And** the "Upload successful" message SHOULD be clearly visible as a status indicator
