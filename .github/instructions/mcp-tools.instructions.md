---
description: "Guidelines for using MCP tools available in this project"
applyTo: "**"
---

## MCP Tools Usage

Always check available MCP tools and utilize them when they match your task. This project has 8 MCP servers configured (see `.vscode/mcp.json`).

## Svelte MCP Server

Access comprehensive Svelte 5 and SvelteKit documentation.

### 1. list-sections

**When:** Start of any Svelte/SvelteKit task
**Purpose:** Discover available documentation sections with titles, use_cases, and paths

### 2. get-documentation

**When:** After analyzing `list-sections` results
**Purpose:** Retrieve full documentation for relevant sections
**Best Practice:** Fetch ALL relevant sections (check `use_cases` field) in one call

### 3. svelte-autofixer

**When:** Before sending Svelte code to user
**Purpose:** Analyze code for issues and suggestions
**Best Practice:** Keep calling until no issues/suggestions returned

### 4. playground-link

**When:** After user confirmation only
**Purpose:** Generate Svelte Playground link
**Never:** Use if code written to project files

## Context7 MCP Tools

Retrieve up-to-date documentation for any library.

**Workflow:**
1. `resolve-library-id` - Get Context7-compatible library ID (e.g., "tailwindcss")
2. `query-docs` - Query documentation with library ID and question

**Example:** For TailwindCSS help, first resolve "tailwindcss", then query specific topics.

**Note:** API key optional but increases rate limits. Get one at https://context7.com/dashboard

## DeepWiki MCP Tools

Explore GitHub repository documentation.

**Available Tools:**
- `read_wiki_structure` - List documentation topics in repository
- `read_wiki_contents` - View detailed repository documentation
- `ask_question` - Ask questions about repository

**Best Practice:** Use instead of manually browsing files when understanding GitHub projects.

## Playwright MCP Tools

Test flows with browser automation using local Playwright installation.

**Configuration:** Uses `configs/playwright/config.json` for settings

**Best Practices:**
- Use role-based locators (`getByRole`, `getByLabel`, etc.)
- Use web-first assertions as documented in `.github/instructions/playwright-typescript.instructions.md`
- Avoid hard-coded waits

## Chrome DevTools MCP

Advanced browser automation and debugging via Chrome DevTools Protocol.

**When to Use:** Complex browser interactions, screenshots, network analysis, performance profiling

**Available in Skill:** See `.github/skills/chrome-devtools/SKILL.md` for detailed usage

**Best Practice:** Use for advanced debugging scenarios beyond standard Playwright testing

## Time MCP Server

Get current date, time, and timezone information.

**Use Cases:**
- Date/time calculations
- Timezone conversions
- Scheduling and time-based logic

## Sequential Thinking MCP

Structured problem-solving with step-by-step reasoning.

**Use Cases:**
- Break down complex tasks into steps
- Systematic debugging approaches
- Architecture planning

## GitHub MCP Server

Interact with GitHub repositories, issues, and pull requests.

**Use Cases:**
- Repository exploration
- Issue and PR management
- GitHub API operations
