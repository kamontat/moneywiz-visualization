---
name: common-troubleshooting
description: Comprehensive troubleshooting guide for the MoneyWiz Visualization project. Use when encountering errors with the development server, CSV parsing issues, or debugging logic. Includes solutions for port conflicts, logging configuration, and migration patterns.
---

# MoneyWiz Troubleshooting

This skill provides a structured approach to identifying and resolving common issues in the MoneyWiz Visualization project.

## When to Use This Skill

- When the development server fails to start or conflicts with other using ports.
- When CSV file uploads fail or data is not parsed correctly.
- When you need to enable verbose logging for debugging business logic.
- When accessing troubleshooting information.

## Common Issues & Solutions

### 1. Development Environment

| Issue | Symptom | Solution |
| :--- | :--- | :--- |
| **Port Conflict** | `EADDRINUSE` or `Port 5173 is in use` | Check `http://localhost:5173/` first. If running, reuse it. Do not start a new `bun run dev` instance blindly. |
| **Bun Version** | Script errors | Ensure you are using `bun` (not npm/node) for all scripts. |

### 2. CSV Parsing & Data

| Issue | Symptom | Solution |
| :--- | :--- | :--- |
| **Header Errors** | Parsing fails on first line | MoneyWiz exports usually start with `sep=,` or similar. The custom parser in `src/lib/csv.ts` handles this. Ensure files are raw exports and support double-quote escaping. |
| **Empty File** | `File is empty` error | Check if the file has 0 bytes or only contains whitespace. |
| **Delimiter** | Parsing incorrectly | The parser auto-detects delimiter from the `sep=` line. If missing, it defaults to comma (`,`). |

## Debugging Workflow

### Enabling Debug Logs

The project uses the `debug` library for namespaced logging.

1.  **Browser Console**:
    ```javascript
    localStorage.debug = 'moneywiz:*'; // Enable all moneywiz logs
    // Refresh page to apply
    ```
2.  **Terminal (Server/Build)**:
    ```bash
    DEBUG=moneywiz:* bun run dev
    ```

**Available Namespaces:**
- `moneywiz:csv` - CSV parsing logic
- `moneywiz:store:*` - All store updates
- `moneywiz:component:*` - Component lifecycle
- `moneywiz:page:*` - Route/Page logic
- `moneywiz:fetch` - Data fetching

### Code Implementation

Use the builder pattern in `src/lib/debug.ts`:

```typescript
import { createLogger } from '$lib/debug';

// Create a logger for a specific feature
const log = createLogger('module').sub('feature').build();
log('Debug message: %s', variable);
```

## References

- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/runes)
- [Debug Library](https://github.com/debug-js/debug)
- [MoneyWiz Export Format Info](https://help.moneywiz.com)
