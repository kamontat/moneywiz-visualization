---
name: mcp-chromedevtools
description: Control Chrome browser tabs to check console logs and inspect DOM. Use when debugging errors, verifying visual elements (snapshots/screenshots), or interacting with pages (click, fill) via MCP.
license: MIT
---

# Chrome DevTools Interaction

## Tools

### Navigation
- `list_pages`: See open tabs.
- `select_page`: Focus a tab.
- `navigate_page`: Go to URL.

### Inspection
- `take_snapshot`: Get accessibility tree (DOM).
- `take_screenshot`: Capture image.
- `list_console_messages`: Check for errors.
- `evaluate_script`: Run JS.

## Workflow

1.  **Find Page**: Run `list_pages` to find the MoneyWiz tab.
2.  **Inspect**: Run `take_snapshot` to find element UIDs.
3.  **Interact**: Use `click` or `fill` with UIDs.
4.  **Debug**: Check `list_console_messages` if things fail.

## MoneyWiz Context

- **URL**: `http://localhost:5173/`
- **Key Elements**:
  - `CsvUploadButton`
  - `SummaryCards`
  - `AppHeader`
