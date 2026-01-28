---
name: common-troubleshooting
description: Identify and resolve common issues. Use when debugging dev server conflicts (port 5173), CSV parsing errors, build failures, or allowing moneywiz:* logs.
---

# MoneyWiz Troubleshooting

## Common Issues & Solutions

### 1. Development Environment

**Issue:** Port 5173 is in use.
**Solution:** Check if another instance is running at `http://localhost:5173`. If so, reuse it. Kill the process if it's zombie (`lsof -i :5173`).

**Issue:** Script errors.
**Solution:** Always use `bun`, not `npm` or `node`.

### 2. CSV Parsing

**Issue:** "Header Errors" or parsing fails first line.
**Solution:** The app expects MoneyWiz exports which may contain a `sep=,` preamble. The parser in `src/lib/csv.ts` handles this. Ensure files are raw exports.

**Issue:** "File is empty".
**Solution:** Check byte size. Verify file input binding.

### 3. Debug Logging

The project uses the `debug` library.

**Enable in Browser Console:**

```javascript
localStorage.debug = 'moneywiz:*'; // Then refresh
```

**Enable in Terminal:**

```bash
DEBUG=moneywiz:* bun run dev
```

**Namespaces:**

- `moneywiz:csv`
- `moneywiz:store`
- `moneywiz:component`
- `moneywiz:fetch`

## Debugging Workflow

1.  **Check Console**: Is it a generic JS error?
2.  **Enable Logs**: Turn on `moneywiz:*`.
3.  **Inspect Network**: Check `src/lib/csv.ts` if upload fails.
4.  **Check Store**: Is the Svelte store updating? (`$state` reactivity).

## References

- `src/lib/debug.ts` (Logger implementation)
- [MoneyWiz Help](https://help.moneywiz.com) (Export formats)
