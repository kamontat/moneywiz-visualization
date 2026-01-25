# ui-design Specification Delta

## ADDED Requirements

### Requirement: Currency Symbol Representation
The application SHALL represent financial values using currency symbols instead of ISO codes to maximize space and readability.

#### Scenario: Display currency as symbols
- **Given** a financial value needs to be displayed
- **Then** it MUST use the appropriate currency symbol (e.g., "฿" for THB)
- **And** it SHOULD NOT use the ISO currency code (e.g., "THB")
- **And** the symbol position MUST follow standard local conventions (e.g., "฿1,000.00")
