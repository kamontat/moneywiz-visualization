---
description: Guide the user through creating a new OpenSpec change proposal
model: Gemini 3 Flash (Preview) (copilot)
---

<!-- PROJECT WRAPPER: This prompt wraps the core OpenSpec proposal workflow -->
<!-- Core workflow is defined in openspec-proposal.prompt.md -->

$ARGUMENTS

## Overview

This prompt guides you through creating a structured OpenSpec change proposal for the MoneyWiz Visualization project. It leverages the standard OpenSpec workflow with project-specific context.

## Workflow

**Step 1: Execute OpenSpec Proposal Flow**

Follow the complete workflow defined in [openspec-proposal.prompt.md](openspec-proposal.prompt.md):
- Review project specs and current state
- Create change proposal with unique ID
- Draft spec deltas and tasks
- Validate strictly before sharing

**Step 2: Project-Specific Considerations**

After completing the OpenSpec workflow, ensure the proposal aligns with project requirements:
- **SvelteKit constraints**: Keep routes minimal, move logic to `$lib`, components to `$components`
- **Static adapter**: All pages must be prerenderable
- **Testing coverage**: Include both unit (Vitest) and E2E (Playwright) test plans
- **Path aliases**: Use `$lib` and `$components` imports
- **Package manager**: All commands use `bun` (not npm/npx/bunx)

## Reference

- Core instructions: See [openspec-proposal.prompt.md](openspec-proposal.prompt.md)
- Project guidelines: See [AGENTS.md](../../AGENTS.md)
- Current specs: Run `openspec list --specs`

---

**Note**: This wrapper currently delegates fully to the OpenSpec proposal workflow. Project-specific proposal steps may be added in future iterations as needed.
