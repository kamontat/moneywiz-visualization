---
name: mcp-chromedevtools
description: "Expert-level browser automation, debugging, and performance analysis using Chrome DevTools MCP. Use for interacting with web pages, capturing screenshots, analyzing network traffic, and profiling performance."
license: MIT
---

# Chrome DevTools Agent

## Overview

A specialized skill for controlling and inspecting a live Chrome browser. This skill leverages the `chrome-devtools` MCP server to perform a wide range of browser-related tasks, from simple navigation to complex performance profiling.

## When to Use

Use this skill when:

- **DataFrame Testing**: Testing CSV upload flows, data parsing, chart rendering
- **Visual Inspection**: Verifying Tailwind CSS styling, responsive breakpoints, chart appearance
- **Debugging**: Checking browser console for TypeScript errors, validating API responses
- **Performance Analysis**: Profiling chart initialization, data processing performance
- **Emulation**: Testing mobile responsiveness (375px, 768px, 1280px, 1920px viewports)
- **MoneyWiz Workflows**: CSV upload → data parse → dashboard visualization

## Tool Categories

### 1. Navigation & Page Management

- `new_page`: Open a new tab/page.
- `navigate_page`: Go to a specific URL, reload, or navigate history.
- `select_page`: Switch context between open pages.
- `list_pages`: See all open pages and their IDs.
- `close_page`: Close a specific page.
- `wait_for`: Wait for specific text to appear on the page.

### 2. Input & Interaction

- `click`: Click on an element (use `uid` from snapshot).
- `fill` / `fill_form`: Type text into inputs or fill multiple fields at once.
- `hover`: Move the mouse over an element.
- `press_key`: Send keyboard shortcuts or special keys (e.g., "Enter", "Control+C").
- `drag`: Drag and drop elements.
- `handle_dialog`: Accept or dismiss browser alerts/prompts.
- `upload_file`: Upload a file through a file input.

### 3. Debugging & Inspection

- `take_snapshot`: Get a text-based accessibility tree (best for identifying elements).
- `take_screenshot`: Capture a visual representation of the page or a specific element.
- `list_console_messages` / `get_console_message`: Inspect the page's console output.
- `evaluate_script`: Run custom JavaScript in the page context.
- `list_network_requests` / `get_network_request`: Analyze network traffic and request details.

### 4. Emulation & Performance

- `resize_page`: Change the viewport dimensions.
- `emulate`: Throttling CPU/Network or emulating geolocation.
- `performance_start_trace`: Start recording a performance profile.
- `performance_stop_trace`: Stop recording and save the trace.
- `performance_analyze_insight`: Get detailed analysis from recorded performance data.

## Workflow Patterns

### Pattern A: Identifying Elements (Snapshot-First)

Always prefer `take_snapshot` over `take_screenshot` for finding elements. The snapshot provides `uid` values which are required by interaction tools.

```markdown
1. `take_snapshot` to get the current page structure.
2. Find the `uid` of the target element.
3. Use `click(uid=...)` or `fill(uid=..., value=...)`.
```

### Pattern B: Troubleshooting Errors

When a page is failing, check both console logs and network requests.

```markdown
1. `list_console_messages` to check for JavaScript errors.
2. `list_network_requests` to identify failed (4xx/5xx) resources.
3. `evaluate_script` to check the value of specific DOM elements or global variables.
```

### Pattern C: Performance Profiling

Identify why a page is slow.

```markdown
1. `performance_start_trace(reload=true, autoStop=true)`
2. Wait for the page to load/trace to finish.
3. `performance_analyze_insight` to find LCP issues or layout shifts.
```

## MoneyWiz Application Pages

### Key Pages to Test

1. **Dashboard (Root)** - `http://localhost:5173/`
   - CSV upload button (CsvUploadButton.svelte)
   - Summary cards showing totals
   - Top categories chart
   - Daily expenses chart
   - Income vs expenses ratio chart

2. **Components to Interact With**
   - CSV file upload input
   - "Clear CSV" button in header
   - Chart visualizations (rendered with Svelte)

### Expected Elements

- AppHeader with "MoneyWiz Report" title link and clear button
- SummaryCards (THB currency)
- TopCategoriesChart
- DailyExpensesChart
- IncomeExpenseRatioChart

## Best Practices for MoneyWiz

- **Context Awareness**: Always run `list_pages` and `select_page` if you are unsure which tab is currently active.
- **Snapshots**: Take a new snapshot after CSV upload or data changes, as DOM structure updates
- **Timeouts**: Use reasonable timeouts (2-5s) for data processing after CSV upload
- **Screenshots**: Capture before/after for chart rendering validation
- **CSV Testing**: Upload test CSV (e.g., `build/data/report.csv`) to verify parsing and visualization
- **TypeScript Errors**: Check console for compilation errors from Vite dev server

