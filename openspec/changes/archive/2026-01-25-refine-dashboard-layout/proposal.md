# Proposal: Refine Dashboard Layout

## Overview
This proposal aims to improve the dashboard's visual hierarchy and usability by implementing layout refinements suggested in the annotated screenshot. The changes focus on better date visibility, clearer section separation via tabs, and improved data summary presentation.

## Problem Statement
The current dashboard layout:
1.  Lacks clear temporal context (start/end dates) at a glance.
2.  The "Dashboard" title is left-aligned and competes with other elements.
3.  Summary cards and charts are grouped together without distinct functional separation.
4.  The upload status section has a sub-optimal information hierarchy (file name is too prominent compared to its status).

## Proposed Solution
1.  **Temporal Context**: Add a date range display (Start Date — End Date) in the top left area, styled as subtler secondary metadata.
2.  **Visual Hierarchy**: Move the "Dashboard" title to the top center.
3.  **Section Separation**: Introduce a tab-based navigation (starting with an "Overview" tab) to separate the charts from the top-level summary. The "Quick Summary" will be placed *above* the tabs for immediate visibility.
4.  **UI Refinement**:
    -   Update "Quick Summary" content to show: Total Income, Total Expense, Cash Flow (Net), and Saving Rate (%).
    -   Swap the file name and status message in the upload section to make the status "Upload successful" secondary to the file name.

## Impact
-   **User Experience**: Improved readability and quicker data comprehension.
-   **Visual Design**: More modern and structured layout following standard dashboard patterns.
-   **Extensibility**: The tab system prepares the application for future specialized views.
