# Installed GitHub Copilot Collections

This document tracks the GitHub Copilot collections installed in this project from [awesome-copilot](https://github.com/github/awesome-copilot).

## Installation Date
2025-01-XX

## Installed Collections

### 1. Frontend Web Development (11 items)
**Source:** `collections/frontend-web-dev.md`
**Purpose:** Essential prompts, instructions, and agents for modern frontend web development

#### Assets Installed:
- **Instructions (9 files):**
  - `angular.instructions.md` - Angular-specific coding standards
  - `nodejs-javascript-vitest.instructions.md` - Node.js + JavaScript + Vitest guidelines
  - `nextjs-tailwind.instructions.md` - Next.js + Tailwind development standards
  - `nextjs.instructions.md` - Next.js App Router best practices
  - `reactjs.instructions.md` - ReactJS development standards
  - `tanstack-start-shadcn-tailwind.instructions.md` - TanStack Start development guide
  - `vuejs3.instructions.md` - VueJS 3 Composition API standards
  - `playwright-python.instructions.md` - Playwright Python test generation
  - `playwright-typescript.instructions.md` - Playwright TypeScript test generation

- **Agents (2 files):**
  - `electron-angular-native.agent.md` - Electron code review mode
  - `expert-react-frontend-engineer.agent.md` - Expert React 19.2 frontend engineer

- **Prompts (2 files):**
  - `playwright-generate-test.prompt.md` - Generate Playwright tests with MCP
  - `playwright-explore-website.prompt.md` - Website exploration for testing

### 2. Testing & Test Automation (11 items)
**Source:** `collections/testing-automation.md`
**Purpose:** Comprehensive testing, test automation, and TDD workflow

#### Assets Installed:
- **Agents (4 files):**
  - `playwright-tester.agent.md` - Testing mode for Playwright tests
  - `tdd-red.agent.md` - TDD Red Phase: Write failing tests first
  - `tdd-green.agent.md` - TDD Green Phase: Make tests pass quickly
  - `tdd-refactor.agent.md` - TDD Refactor Phase: Improve quality & security

- **Prompts (3 files):**
  - `junit-best-practices.prompt.md` - JUnit 5+ best practices
  - `nunit-best-practices.prompt.md` - NUnit best practices
  - `ai-prompt-safety-review.prompt.md` - AI prompt safety review & improvement

- **Instructions (2 files):**
  - `playwright-python.instructions.md` - Playwright Python test generation (shared with Frontend)
  - `playwright-typescript.instructions.md` - Playwright TypeScript test generation (shared with Frontend)

- **Shared Prompts (2 files):**
  - `playwright-generate-test.prompt.md` (shared with Frontend)
  - `playwright-explore-website.prompt.md` (shared with Frontend)

### 3. Security & Code Quality (6 items)
**Source:** `collections/security-best-practices.md`
**Purpose:** Security frameworks, accessibility guidelines, and performance optimization

#### Assets Installed:
- **Instructions (5 files):**
  - `accessibility.instructions.md` - WCAG compliance guidance
  - `object-calisthenics.instructions.md` - Clean code principles for business logic
  - `performance-optimization.instructions.md` - Comprehensive performance best practices
  - `secure-coding-owasp.instructions.md` - OWASP-based secure coding guidelines
  - `self-explanatory-code.instructions.md` - Self-documenting code practices

- **Prompts (1 file):**
  - `ai-prompt-safety-review.prompt.md` (shared with Testing)

## Total Assets Installed

- **Instructions:** 14 unique files
- **Agents:** 7 unique files
- **Prompts:** 6 unique files
- **Total Unique Assets:** 25 files (some assets shared across collections)

## Usage Guide

### Instructions
Instructions automatically activate when editing files matching their `applyTo` patterns. They guide GitHub Copilot to follow specific coding standards and best practices.

**Example:** When editing `.tsx` or `.jsx` files, React instructions automatically apply.

### Prompts
Prompts are invoked explicitly in GitHub Copilot Chat:

```
/playwright-generate-test
/junit-best-practices
/ai-prompt-safety-review
```

### Agents
Agents are specialized AI assistants focused on specific tasks:

```
@tdd-red - Write failing tests based on requirements
@tdd-green - Implement code to pass tests
@tdd-refactor - Improve code quality and security
@playwright-tester - Testing mode for Playwright
@expert-react-frontend-engineer - React development expert
```

## Integration with Project Stack

These collections align perfectly with the project's technology stack:
- **SvelteKit + TypeScript:** Frontend development patterns adaptable to Svelte
- **Playwright + Vitest:** Testing tools and TDD workflow
- **Tailwind CSS 4:** Next.js + Tailwind instructions provide relevant patterns
- **Static Deployment:** Performance optimization guidelines ensure fast load times
- **Security:** OWASP guidelines protect against common vulnerabilities

## TDD Workflow Example

For GitHub issue #123:

1. **Red Phase:** `@tdd-red` - Write failing tests describing desired behavior
2. **Green Phase:** `@tdd-green` - Implement minimal code to pass tests
3. **Refactor Phase:** `@tdd-refactor` - Improve code quality and security

Each agent integrates with GitHub issues, extracting requirements and tracking completion.

## Maintenance

To update collections:
1. Check [awesome-copilot releases](https://github.com/github/awesome-copilot/releases)
2. Re-run collection installation for updated assets
3. Review breaking changes in collection manifests

## References

- **Repository:** https://github.com/github/awesome-copilot
- **Collections Documentation:** https://github.com/github/awesome-copilot/blob/main/docs/README.collections.md
- **Contributing Guide:** https://github.com/github/awesome-copilot/blob/main/CONTRIBUTING.md
