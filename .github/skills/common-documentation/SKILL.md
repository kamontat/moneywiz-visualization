---
name: common-documentation
description: Create and maintain high-quality Markdown documentation. Use when creating/updating READMEs, docs, blog posts, structuring project documentation, or validating Markdown formatting/accessibility.
---

# Documentation Standards

## Content Rules

### 1. Structure & Headings
- **No H1 in Body**: The title is usually H1. Start with H2 (`##`).
- **Hierarchy**: Nest properly (`##` -> `###` -> `####`).
- **Limit Depth**: Avoid going deeper than H4.

### 2. Formatting
- **Lists**: Use `-` for bullets, `1.` for numbers. Indent with 2 spaces.
- **Code**: Use fenced blocks with language tags (e.g., ```typescript).
- **Line Length**: Soft wraps preferred, but keep source lines <80 chars where possible for readability.
- **Whitespace**: One blank line between paragraphs.

### 3. Media & Links
- **Links**: Use descriptive text. `[Download report](url)`, not `[click here](url)`.
- **Images**: Always include alt text. `![Dashboard screenshot](url)`.
- **Tables**: Align columns in source for maintainability.

## Frontmatter (YAML)

Include YAML frontmatter for specific file types (posts, skills).

```yaml
---
post_title: 'Title Here'
author1: 'Kamontat'
post_slug: 'my-post'
categories: ['DevOps']
tags: ['GitHub', 'CI/CD']
summary: 'Brief description'
post_date: '2026-01-28'
---
```

## Checklist

- [ ] Hierarchy starts at H2.
- [ ] Code blocks have language identifiers.
- [ ] Images have alt text.
- [ ] Links used descriptive text.
- [ ] Frontmatter is valid (if applicable).
