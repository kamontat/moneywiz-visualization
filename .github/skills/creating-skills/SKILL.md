---
name: creating-skills
description: Create new Agent Skills to extend Copilot capabilities. Use when defining new tools/workflows, adding specialized knowledge domains (e.g. PDF, DB), or implementing the agentskills.io specification.
---

# Creating Agent Skills

## Directory Structure

```
.github/skills/
  └── my-skill/
      ├── SKILL.md       # Required
      ├── scripts/       # Optional
      ├── assets/        # Optional
      └── references/    # Optional
```

## SKILL.md Format

### Frontmatter (Required)

```yaml
---
name: my-skill
description: A short (1-1024 chars) description of what the skill does and when to use it. Include keywords!
license: MIT # Optional
---
```

### Body Content

- **Title**: `# My Skill`
- **When to Use**: Clear bullet points.
- **Instructions**: Step-by-step guide.
- **Tools**: List tools this skill relies on (if any).

## Best Practices

1. **Progressive Disclosure**:
   - `name` and `description` are loaded first. Make them count.
   - The body is loaded only when activated.
2. **Kept it Short**: < 500 lines. Move details to `references/`.
3. **Relative Paths**: Link to references using `./references/doc.md`.

## Example

```markdown
---
name: database-helper
description: Helper for SQL query generation and optimization. Use when working with Postgres or MySQL.
---

# Database Helper

## When to Use
(Note: Merged into description for new skills)

## Instructions
...
```
