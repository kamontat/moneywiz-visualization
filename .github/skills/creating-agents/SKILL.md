---
name: creating-agents
description: Create and configure new Agents for GitHub Copilot. Use when creating new agents, defining capabilities/tools, writing system prompts, or troubleshooting agent behavior.
---

# Agent Creation Guide

## Specification

### 1. File Location

- Agents live in `.github/copilot/`.
- Filename format: `agent-name.agent.md` (or `.json` if using that format, but `.md` is preferred for readability).

### 2. Frontmatter

```yaml
---
name: my-agent
description: What the agent does.
model: gpt-4
tools:
  - tool-name-1
  - tool-name-2
---
```

### 3. System Prompt

The body of the markdown file acts as the system prompt.

- **Role**: Define who the agent is.
- **Rules**: Strict constraints (e.g., "Always use Svelte 5").
- **Workflow**: Step-by-step reasoning process.

## Best Practices

- **Minimal Tools**: Only give the agent tools it strictly needs.
- **Clear Goals**: The description should be specific about _what_ the agent solves.
- **Example Prompts**: Include examples of how users should interact with it.

## Example

```markdown
---
name: docs-helper
description: Assists with writing documentation.
tools:
  - read_file
  - search_file
---

You are an expert technical writer.
Your goal is to help users write clear, concise documentation.

Rules:

1. Use US English.
2. Follow the Microsoft Style Guide.
```
