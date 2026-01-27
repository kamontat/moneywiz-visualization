---
name: creating-prompts
description: Create reusable prompt files (.prompt.md) for Copilot. Use when automating repetitive tasks, sharing complex workflows, or creating parameterized queries.
---

# Creating Reusable Prompts

## File Format

- **Extension**: `.prompt.md`
- **Location**: `.github/prompts/`

### Frontmatter

```yaml
---
name: refactor-component
description: Refactor a component to use the new design system.
tools: ["read_file"]
---
```

### Body

The body is the user message sent to the LLM.

- **Variables**: Use mustache syntax `{{ variable }}` if supported by your setup, or standard placeholders.
- **Context**: You can reference specific files or selections.

## Best Practices

1. **Self-Contained**: The prompt should explain the task fully.
2. **Tools**: List necessary tools in frontmatter.
3. **Output Format**: Specify how you want the answer (e.g., "Show diff only").

## Example

```markdown
---
name: explain-code
description: Explain the selected code in simple terms.
---

Please explain the following code:

{{ selection }}

Focus on the business logic.
```
