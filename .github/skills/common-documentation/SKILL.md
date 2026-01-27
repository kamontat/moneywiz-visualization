---
name: common-documentation
description: Standards for creating and maintaining high-quality Markdown documentation. Includes formatting rules, content structure, and front matter requirements for blog posts and project docs.
---

# Documentation & Markdown Standards

This skill provides guidelines for writing, formatting, and validating Markdown content within the project.

## When to Use This Skill

- When creating or updating `README.md`, `AGENTS.md`, or other `.md` files.
- When writing blog posts or technical articles that require specific YAML front matter.
- When organizing project documentation structure.
- When validating Markdown formatting for accessibility and readability.

## Markdown Content Rules

### 1. Structure & Headings

- **No H1 in Body**: Do not use `# Heading`. The title is typically generated from metadata or the filename.
- **Hierarchy**: Use `##` (H2) for main sections and `###` (H3) for subsections.
- **Nested Levels**: Avoid going deeper than H4. If you need H5, consider restructuring the document or splitting it into multiple files.

### 2. Formatting

- **Lists**:
  - Use `-` for bullet points.
  - Use `1.` for numbered lists.
  - Indent nested lists with exactly two spaces.
- **Code Blocks**: Always use fenced code blocks (`) with a language identifier (e.g., `typescript).
- **Line Length**:
  - Keep lines under **80 characters** for better readability in simple editors.
  - Hard limit of **400 characters** for validators.
- **Whitespace**: Use single blank lines to separate paragraphs and sections. Avoid excessive vertical whitespace.

### 3. Media & Links

- **Links**: Use descriptive link text: `[Download the report](url)` instead of `[click here](url)`.
- **Images**: Always include meaningful alt text for accessibility: `![Dashboard overview showing revenue charts](url)`.
- **Tables**: Use standard Markdown table syntax. Ensure columns are aligned in the source for maintainability.

## Metadata & Front Matter

When a file requires metadata (e.g., blog posts, skill definitions, instructions), include a YAML front matter block at the top:

```yaml
---
post_title: 'Title Here'
author1: 'Author Name'
post_slug: 'url-friendly-slug'
microsoft_alias: 'alias'
featured_image: 'url'
categories: ['Category']
tags: ['Tag1', 'Tag2']
ai_note: 'AI was/was not used'
summary: 'Brief description'
post_date: 'YYYY-MM-DD'
---
```

## Quality Checklist

- [ ] Hierarchy uses H2/H3 appropriately (No H1).
- [ ] Code blocks specify a language.
- [ ] Images have descriptive alt text.
- [ ] Line lengths are manageable (soft breaks for paragraphs, hard breaks for lists/docs).
- [ ] YAML front matter is present and valid if required.
- [ ] Documentation reflects the current state of the code.
