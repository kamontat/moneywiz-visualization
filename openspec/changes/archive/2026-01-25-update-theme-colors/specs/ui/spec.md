# ui Specification Delta (update-theme-colors)

## ADDED Requirements

### Requirement: Visual Theme Palette
The application SHALL use a consistent professional color palette focused on financial clarity.

#### Scenario: Primary and Secondary Color Palette
- **Given** the application is rendered
- **Then** the primary brand color MUST be a professional blue (`#60a5fa`)
- **And** the secondary brand color MUST be a professional purple (`#9333ea`)
- **And** these colors MUST be used consistently across branding elements (logo, buttons)
- **And** data visualizations SHOULD use the theme colors, except where semantic colors provide better clarity (e.g., green for income, red for expenses)
