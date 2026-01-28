---
name: creating-instructions
description: Create custom instruction files (.instructions.md) to guide Copilot. Use when enforcing coding styles, defining architectural patterns, or establishing project-specific standards.
---

# Creating Custom Instructions

## File Format

- **Extension**: `.instructions.md`
- **Location**: `.github/instructions/` (or `.github/copilot/instructions/` depending on config).

### Frontmatter

```yaml
---
description: Brief description of what this instruction covers.
applyTo: '**/*.ts' # Glob pattern
---
```

### Body

The body contains the instructions.

- **Be Specific**: "Use `const`" is better than "Use modern JS".
- **Show Examples**:

  ```typescript
  // Bad
  var x = 1;

  // Good
  const x = 1;
  ```

## Best Practices

1. **Scoped**: Use `applyTo` to limit instructions to relevant files.
2. **Concise**: Copilot has a context window. Don't waste it.
3. **Updated**: Keep instructions in sync with project evolution.

## Example

```markdown
---
description: Ensure all components use Svelte 5 runes.
applyTo: 'src/components/**/*.svelte'
---

# Svelte 5 Rules

1. Use `$state` instead of `writable`.
2. Use `$props` instead of `export let`.
```
